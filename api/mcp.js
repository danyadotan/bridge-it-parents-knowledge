// Bridget MCP server — stateless, read-only, no data collection.
// Implements MCP Streamable HTTP (JSON responses) with plain JSON-RPC 2.0.
// No request content is logged or stored. No outbound network calls.

const SERVER_INFO = { name: "bridget-il-child-rights", title: "Bridget: Israeli Child Rights", version: "0.2.0" };
const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const KOL_ZCHUT_SEARCH = (q) => "https://www.kolzchut.org.il/he/Special:Search?search=" + encodeURIComponent(q);

const PARENTS_PORTAL = {
  name: "פורטל הורים — משרד החינוך",
  url: "https://parents.education.gov.il/",
  use: "החלטות ופרוטוקולים דיגיטליים, טפסים ובקשות שירות. נדרשת הזדהות.",
};
const GOV_IL = { name: "gov.il — שירותים ומידע ממשלתי", url: "https://www.gov.il/he", use: "חוזרי מנכ\"ל, טפסים רשמיים ופרטי קשר של משרדים." };
const BTL = { name: "ביטוח לאומי", url: "https://www.btl.gov.il/", use: "קצבת ילד נכה, טפסים ותנאי זכאות." };

const TOPICS = {
  eligibility_committee: {
    label: "ועדת זכאות ואפיון",
    search: "ועדת זכאות ואפיון",
    sources: [PARENTS_PORTAL, GOV_IL],
    local: "מחלקת חינוך מיוחד ברשות המקומית (מזכירות הוועדה)",
  },
  missing_documents: {
    label: "פרוטוקולים והחלטות חסרים",
    search: "פרוטוקול ועדת זכאות ואפיון",
    sources: [PARENTS_PORTAL, GOV_IL],
    local: "מחלקת חינוך מיוחד ברשות המקומית, או רכזת השילוב / מתי\"א",
  },
  postponement: {
    label: "דחיית מועד ועדה",
    search: "ועדת זכאות ואפיון דחיית מועד",
    sources: [GOV_IL, PARENTS_PORTAL],
    local: "מזכירות הוועדה במחלקת חינוך מיוחד ברשות המקומית",
  },
  appeal: {
    label: "ערר / השגה על החלטה",
    search: "ערר על החלטת ועדת זכאות ואפיון",
    sources: [GOV_IL, PARENTS_PORTAL],
    local: "מחוז משרד החינוך הרלוונטי (ועדת ערר מחוזית)",
  },
  disabled_child_allowance: {
    label: "קצבת ילד נכה",
    search: "קצבת ילד נכה",
    sources: [BTL, GOV_IL],
    local: "סניף ביטוח לאומי הקרוב",
  },
  integration: {
    label: "שילוב בחינוך הרגיל וסל אישי",
    search: "סל אישי שילוב",
    sources: [PARENTS_PORTAL, GOV_IL],
    local: "רכזת השילוב בבית הספר / מתי\"א",
  },
};

const TEMPLATES = {
  request_missing_protocols: {
    title: "בקשת פרוטוקולים והחלטות משנים קודמות",
    to: "מחלקת חינוך מיוחד ברשות המקומית",
    body:
      "שלום רב,\nאני [שם ההורה], הורה של [שם הילד/ה], [כיתה/גן].\nאבקש לקבל עותק של הפרוטוקולים וההחלטות של ועדות הזכאות והאפיון משנים [שנים].\nאשמח לקבל אותם במייל לכתובת [כתובת מייל]. תודה,\n[שם וטלפון]",
  },
  request_postponement: {
    title: "בקשה לדחיית מועד ועדה",
    to: "מזכירות ועדת הזכאות והאפיון",
    body:
      "שלום רב,\nקיבלנו זימון לוועדת זכאות ואפיון עבור [שם הילד/ה] בתאריך [תאריך].\nמסיבה [סיבה קצרה], נבקש לקבוע מועד חלופי. נוח לנו בתאריכים: [2–3 אפשרויות].\nתודה רבה,\n[שם וטלפון]",
  },
  request_documents_before_committee: {
    title: "בקשת החומרים לקראת הוועדה",
    to: "מזכירות ועדת הזכאות והאפיון",
    body:
      "שלום רב,\nלקראת ועדת הזכאות והאפיון של [שם הילד/ה] בתאריך [תאריך], נבקש לקבל את כל החומרים שיוצגו בוועדה מבעוד מועד.\nכמו כן נבקש לעדכן שנגיע בליווי [שם ותפקיד המלווה].\nתודה,\n[שם וטלפון]",
  },
  ask_who_handles: {
    title: "בירור מי הגורם המטפל",
    to: "מוקד הרשות המקומית / מחלקת חינוך",
    body:
      "שלום,\nאני מנסה לברר מי מטפל ב[נושא] עבור [שם הילד/ה], [כיתה/גן, בית ספר].\nאשמח לשם, תפקיד ודרך יצירת קשר עם הגורם המתאים.\nתודה,\n[שם וטלפון]",
  },
};

const ACTION_FRAMEWORK = [
  { section: "איפה נמצאים עכשיו", guidance: "1–2 משפטים שממקמים את ההורה על ציר הזמן." },
  { section: "מה עושים עכשיו", guidance: "צעד אחד מיידי, עם הודעה מוכנה להעתקה אם צריך לפנות למישהו." },
  { section: "הכנה מראש והזכויות", guidance: "רשימה קצרה של זכויות רלוונטיות לשלב הזה בלבד. לציין מה קבוע בחוק ומה נוהל מקומי, ולאמת מול מקור רשמי." },
  { section: "מה הלאה וחריגים", guidance: "2–3 השלבים הבאים, וענפי אם/אז: מועד לא מתאים, מסמכים חסרים, אי-הסכמה עם ההחלטה." },
  { section: "למי פונים", guidance: "גורם, תפקיד וקישור רשמי ליד כל צעד — לא בסוף. לא למסור מספרי טלפון מהזיכרון." },
];

const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const TOOLS = [
  {
    name: "get_official_sources",
    title: "Get official sources for a procedure",
    description:
      "Returns the prioritized official Israeli sources to verify for a child-rights or special-education procedure (Kol Zchut search link, Ministry of Education Parents Portal, gov.il, Bituach Leumi) and which local office handles it. Use before answering, then verify the details on those sources. Returns links only; it does not fetch them.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: Object.keys(TOPICS), description: "The procedure the parent is dealing with." },
        city: { type: "string", description: "Optional city or local authority name, used only to phrase the local-office hint. Not stored." },
      },
      required: ["topic"],
      additionalProperties: false,
    },
    annotations: { title: "Get official sources for a procedure", ...RO },
  },
  {
    name: "get_message_template",
    title: "Get a Hebrew message template",
    description:
      "Returns a short, ready-to-fill Hebrew email/WhatsApp template with [placeholders] for a common request: missing protocols, postponing a committee, requesting materials before a committee, or asking who handles a matter. Fill the placeholders with the parent before sending.",
    inputSchema: {
      type: "object",
      properties: { template: { type: "string", enum: Object.keys(TEMPLATES) } },
      required: ["template"],
      additionalProperties: false,
    },
    annotations: { title: "Get a Hebrew message template", ...RO },
  },
  {
    name: "get_action_framework",
    title: "Get the Bridget response structure",
    description:
      "Returns the action-hierarchy structure Bridget uses for every answer (current status, one immediate step, rights, next stages and exceptions, who to contact), plus the closing disclaimer line.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { title: "Get the Bridget response structure", ...RO },
  },
];

function textResult(obj) {
  return { content: [{ type: "text", text: JSON.stringify(obj, null, 2) }], structuredContent: obj };
}

function callTool(name, args) {
  args = args || {};
  if (name === "get_official_sources") {
    const t = TOPICS[args.topic];
    if (!t) return { isError: true, content: [{ type: "text", text: "Unknown topic. Use one of: " + Object.keys(TOPICS).join(", ") }] };
    const city = typeof args.city === "string" && args.city.trim() ? args.city.trim().slice(0, 60) : null;
    return textResult({
      topic: t.label,
      verify_in_this_order: [
        { name: "כל זכות", url: KOL_ZCHUT_SEARCH(t.search), use: "זכויות, לוחות זמנים וחריגים בניסוח מובנה." },
        ...t.sources,
      ],
      local_office: city ? t.local + " — " + city + " (לאתר את פרטי הקשר באתר הרשות)" : t.local,
      rules: [
        "Verify deadlines, phone numbers and form links on the sources before stating them.",
        "Distinguish binding law (חוק החינוך המיוחד) from local practice.",
      ],
    });
  }
  if (name === "get_message_template") {
    const t = TEMPLATES[args.template];
    if (!t) return { isError: true, content: [{ type: "text", text: "Unknown template. Use one of: " + Object.keys(TEMPLATES).join(", ") }] };
    return textResult(t);
  }
  if (name === "get_action_framework") {
    return textResult({
      sections: ACTION_FRAMEWORK,
      closing_line: "מידע כללי להתמצאות בלבד, לא ייעוץ משפטי.",
      when_in_dispute: "במחלוקת או ערר — להזכיר סיוע משפטי חינם (קליניקות משפטיות, אלו\"ט, הסיוע המשפטי).",
    });
  }
  return null;
}

function handle(msg) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return { jsonrpc: "2.0", id: msg && msg.id !== undefined ? msg.id : null, error: { code: -32600, message: "Invalid Request" } };
  }
  const isNotification = msg.id === undefined;
  const ok = (result) => (isNotification ? null : { jsonrpc: "2.0", id: msg.id, result });
  const err = (code, message) => (isNotification ? null : { jsonrpc: "2.0", id: msg.id, error: { code, message } });

  switch (msg.method) {
    case "initialize": {
      const requested = msg.params && msg.params.protocolVersion;
      return ok({
        protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "Read-only helper for Israeli parents navigating special-education committees and child-rights procedures. Call get_official_sources before answering, verify details there, then answer in the get_action_framework structure. General information, not legal advice.",
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools: TOOLS });
    case "tools/call": {
      const p = msg.params || {};
      const r = callTool(p.name, p.arguments);
      return r ? ok(r) : err(-32602, "Unknown tool: " + p.name);
    }
    default:
      if (msg.method.startsWith("notifications/")) return null;
      return err(-32601, "Method not found");
  }
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "Method not allowed. Use POST (stateless Streamable HTTP)." } });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); }
  }

  const batch = Array.isArray(body);
  const responses = (batch ? body : [body]).map(handle).filter(Boolean);
  if (responses.length === 0) return res.status(202).end();
  res.setHeader("Content-Type", "application/json");
  return res.status(200).send(JSON.stringify(batch ? responses : responses[0]));
};

module.exports.handle = handle;
