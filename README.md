# Bridge-iT × כזו אני — Parents Knowledge (IL Civic Skills)

Open-source, non-commercial AI agent skills for navigating official Israeli child rights, special education committees (ועדת זכאות ואפיון), and public services in Hebrew.

**מלווה AI בקוד פתוח (ללא שימוש מסחרי) לניווט בזכויות הילד וועדות זכאות בישראל.**

---

## 🔒 Privacy First | פרטיות לפני הכל

- **No personal or medical data is collected, requested, or stored.**
- הכלי אינו מבקש, אינו אוסף ואינו שומר מידע אישי או רפואי של הורים או ילדים. הוא מסדר מידע ציבורי רשמי ועדכני בלבד (כל זכות, משרד החינוך, gov.il ורשויות מקומיות).

---

## 📂 Available Skills | סקילס זמינים

- **[IL Child Rights Navigator](./skills/il-child-rights-navigator/SKILL.md)** — היררכיית פעולה מעשית להורים בישראל מול ועדות זכאות ואפיון, מסמכים ופרוטוקולים חסרים, דחיית מועדים, עררים וזכויות הילד.

For AI agents & crawlers, see [`llms.txt`](./llms.txt).

---

## 🔌 Claude Plugin & Connector | תוסף ומחבר ל-Claude

This repo is also the **Bridget** Claude plugin (`.claude-plugin/plugin.json`, `skills/`, `.mcp.json`).

- **Connector (remote MCP, read-only, no auth):** `https://bridge-it-parents-knowledge.vercel.app/mcp`
- **Tools:** `get_official_sources`, `get_message_template`, `get_action_framework`
- **Source:** [`api/mcp.js`](./api/mcp.js) — stateless, no logging, no storage, no outbound calls
- **Docs:** [bridge-it-parents-knowledge.vercel.app/#connector](https://bridge-it-parents-knowledge.vercel.app/#connector)

## 🛡️ Privacy Policy

The connector receives only tool names and short arguments (topic, template name, optional city) — never conversations, documents or a child's details — and does not log or store them. Full policy: [privacy.html](https://bridge-it-parents-knowledge.vercel.app/privacy.html) · Terms: [terms.html](https://bridge-it-parents-knowledge.vercel.app/terms.html) · Accessibility: [accessibility.html](https://bridge-it-parents-knowledge.vercel.app/accessibility.html)

## 🆘 Support

[danya@dynamicbridge.io](mailto:danya@dynamicbridge.io) · [GitHub issues](https://github.com/danyadotan/bridge-it-parents-knowledge/issues)

---

## 🚀 How to Use | איך משתמשים

1. **Quick use (Copy):** Open the landing page or copy the contents of [`SKILL.md`](./skills/il-child-rights-navigator/SKILL.md) and paste it into any chat (Gemini, Claude, ChatGPT).
2. **Permanent install (Download):** Import `SKILL.md` into platforms that support Agent Skills (such as Gemini Skills, Claude, or Cursor).

---

## 💡 About | אודות

המיזם נולד מתוך החיבור שבין הבית לקליניקה — כאמא וכמטפלת רגשית בילדים ומשפחות המתמודדות עם הפרעת קשב וכל הנלווה לה (**כזו אני**), ומתוך תשתית הכלים של **Bridge-iT**.

- 🌐 **Bridge-iT:** [www.dynamicbridge.io](https://www.dynamicbridge.io)
- 🌿 **כזו אני (Kazoani):** [kazoani.com](https://kazoani.com)
- 📞 **Contact:** +972.54.22.99.000

---

## ⚖️ License & Disclaimer

- **License:** [CC BY-NC 4.0](./LICENSE) — Free to share and adapt for non-commercial use with attribution to **Bridge-iT × כזו אני**.
- **Disclaimer:** General informational guidance only. Does not constitute legal, medical, psychological, or therapeutic advice. Use at your own responsibility.
