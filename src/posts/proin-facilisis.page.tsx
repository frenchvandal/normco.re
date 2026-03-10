/** Sample post #3 — Proin facilisis (2025). */

export const id = "proin-facilisis";
/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;

/** English post title. */
export const title = "Proin Facilisis: Making Things Easier";
/** Publication date. */
export const date = new Date("2025-04-12");
/** Post meta description. */
export const description =
  "On the philosophy of reducing friction — in code, in design, and in everyday life.";
/** Post tags. */
export const tags = ["software", "design"];

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Proin Facilisis\u00a0: rendre les choses plus simples",
  description:
    "Sur la philosophie de la réduction des frictions, dans le code, le design et la vie quotidienne.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "Proin Facilisis：让事情更轻松",
  description: "关于降低摩擦的哲学：在代码、设计和日常生活中。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "Proin Facilisis：讓事情更輕鬆",
  description: "關於降低摩擦的哲學：在程式碼、設計與日常生活中。",
} as const;

/** Renders the post body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  if (data.lang === "fr") {
    return `<p>
  <em>Proin facilisis</em> — en latin, «&nbsp;favoriser l’aisance&nbsp;». L’expression apparaît
  dans d’anciens textes botaniques pour décrire une plante qui facilite la
  digestion, adoucit un passage, lève une obstruction. Comme philosophie de
  conception logicielle, la formule se transpose étonnamment bien.
</p>

<p>
  Un bon logiciel réduit les frictions. Il anticipe l’étape suivante de
  l’utilisateur. Il propose la bonne affordance au bon moment. Il s’efface.
</p>

<h2>L’inventaire des frictions</h2>

<p>
  Proin in tellus sit amet nibh dignissim sagittis. La première étape pour
  réduire les frictions est de les cartographier. Où l’utilisateur ralentit-il&nbsp;?
  Où l’attention monte-t-elle&nbsp;? Où les erreurs se concentrent-elles&nbsp;?
</p>

<p>
  Dans une application web classique, les moments de forte friction sont
  prévisibles&nbsp;: onboarding, envoi de formulaire, récupération après erreur et
  états de chargement. Ce sont les vestibules du produit, les seuils que
  l’utilisateur doit franchir pour atteindre la valeur.
</p>

<pre><code class="language-ts">// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined { /* … */ }

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(\`User not found: \${id}\`);
  }
  return user;
}
</code></pre>

<h2>Le paradoxe de la simplicité</h2>

<p>
  Vivamus pretium aliquet erat. Il y a un paradoxe au cœur du «&nbsp;rendre simple&nbsp;»&nbsp;:
  c’est difficile. Éliminer les frictions demande une compréhension fine de
  l’utilisateur, du contexte et des modes d’échec. Cela exige plus de travail
  côté concepteur pour en demander moins côté utilisateur.
</p>

<p>
  C’est pour cela que la simplicité est une forme de générosité. Chaque étape
  inutile retirée du parcours rend du temps à l’utilisateur, du temps qu’il
  peut consacrer à ce qui compte vraiment.
</p>

<h2>Facilisis en pratique</h2>

<p>
  Donec aliquet metus ut erat semper, et tincidunt nulla luctus. Quelques
  principes vers lesquels je reviens régulièrement&nbsp;:
</p>

<ul>
  <li>Les valeurs par défaut doivent convenir à la majorité des usages.</li>
  <li>Les messages d’erreur doivent expliquer le problème et la correction.</li>
  <li>Le chemin nominal ne devrait demander aucun effort mental.</li>
  <li>La configuration doit être possible, jamais obligatoire.</li>
  <li>La documentation fait partie intégrante du produit.</li>
</ul>

<p>
  Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam
  tincidunt tempus. Le nom même de ce principe — <em>nulla facilisi</em>, «&nbsp;rien de
  facile&nbsp;» — rappelle que la simplicité, bien comprise, n’est jamais accidentelle.
</p>`;
  }

  if (data.lang === "zh-hans") {
    return `<p>
  <em>Proin facilisis</em> 在拉丁语里可以理解为“促进顺畅”。它曾出现在古老植物学文本中，
  形容一种能帮助消化、疏通阻滞的植物。作为软件设计哲学，这个词意外地贴切。
</p>

<p>
  好的软件会降低摩擦。它会提前预判用户的下一步，在恰当时机给出恰当的可供性，
  然后退到背景里。
</p>

<h2>先做“摩擦清单”</h2>

<p>
  Proin in tellus sit amet nibh dignissim sagittis. 减少摩擦的第一步是把它画出来：
  用户在哪些环节会放慢？注意力在哪些节点会飙升？错误会集中出现在哪里？
</p>

<p>
  在典型 Web 应用里，高摩擦时刻通常很稳定：注册引导、表单提交、错误恢复、加载状态。
  这些就是产品的“门厅”，是用户为了抵达价值必须跨过的门槛。
</p>

<pre><code class="language-ts">// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined { /* … */ }

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(\`User not found: \${id}\`);
  }
  return user;
}
</code></pre>

<h2>“简单”本身的悖论</h2>

<p>
  Vivamus pretium aliquet erat. “让事情变简单”最困难的地方在于：它真的很难。
  你需要深入理解用户、场景和失败模式。也就是说，构建者要多做工作，用户才能少费力。
</p>

<p>
  这也是为什么“简单”是一种慷慨。每移除一个不必要步骤，都是把时间还给用户，
  让他们去做真正重要的事。
</p>

<h2>如何把 facilisis 落地</h2>

<p>
  Donec aliquet metus ut erat semper, et tincidunt nulla luctus. 我经常回到这些原则：
</p>

<ul>
  <li>默认值应覆盖多数人多数场景。</li>
  <li>错误信息应说明问题，也说明修复路径。</li>
  <li>主流程不应要求额外思考。</li>
  <li>配置应当可选，而不是前置门槛。</li>
  <li>文档是产品的一部分，而不是附录。</li>
</ul>

<p>
  Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam
  tincidunt tempus. 这个原则的名字本身也提醒我们：
  <em>nulla facilisi</em>，没有真正“天然简单”的事。好的简单，从来都不是偶然。
</p>`;
  }

  if (data.lang === "zh-hant") {
    return `<p>
  <em>Proin facilisis</em> 在拉丁語裡可理解為「促進順暢」。它曾出現在古老植物學文本中，
  形容一種能幫助消化、疏通阻滯的植物。作為軟體設計哲學，這個詞意外地貼切。
</p>

<p>
  好的軟體會降低摩擦。它會提前預判使用者的下一步，在恰當時機給出恰當的可供性，
  然後退到背景裡。
</p>

<h2>先做「摩擦清單」</h2>

<p>
  Proin in tellus sit amet nibh dignissim sagittis. 減少摩擦的第一步是把它畫出來：
  使用者在哪些環節會放慢？注意力在哪些節點會飆升？錯誤會集中出現在哪裡？
</p>

<p>
  在典型 Web 應用中，高摩擦時刻通常很穩定：註冊引導、表單提交、錯誤復原、載入狀態。
  這些就是產品的「門廳」，是使用者為了抵達價值必須跨過的門檻。
</p>

<pre><code class="language-ts">// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined { /* … */ }

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(\`User not found: \${id}\`);
  }
  return user;
}
</code></pre>

<h2>「簡單」本身的悖論</h2>

<p>
  Vivamus pretium aliquet erat. 「讓事情變簡單」最困難的地方在於：它真的很難。
  你需要深入理解使用者、情境與失敗模式。也就是說，建構者要多做工作，使用者才能少費力。
</p>

<p>
  這也是為什麼「簡單」是一種慷慨。每移除一個不必要步驟，都是把時間還給使用者，
  讓他們去做真正重要的事。
</p>

<h2>如何把 facilisis 落地</h2>

<p>
  Donec aliquet metus ut erat semper, et tincidunt nulla luctus. 我經常回到這些原則：
</p>

<ul>
  <li>預設值應覆蓋多數人與多數情境。</li>
  <li>錯誤訊息應說明問題，也說明修復路徑。</li>
  <li>主流程不應要求額外思考。</li>
  <li>設定應當可選，而不是前置門檻。</li>
  <li>文件是產品的一部分，而不是附錄。</li>
</ul>

<p>
  Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam
  tincidunt tempus. 這個原則的名稱本身也提醒我們：
  <em>nulla facilisi</em>，沒有真正「天然簡單」的事。好的簡單，從來都不是偶然。
</p>`;
  }

  return `<p>
  <em>Proin facilisis</em> — Latin for "promoting ease." It appears in old
  botanical texts to describe a plant that aids digestion, smooths a passage,
  clears an obstruction. As a philosophy for building software, it translates
  remarkably well.
</p>

<p>
  Good software reduces friction. It anticipates the user's next step. It
  provides the right affordance at the right moment. It gets out of the way.
</p>

<h2>The friction inventory</h2>

<p>
  Proin in tellus sit amet nibh dignissim sagittis. The first step in reducing
  friction is to map it. Where does the user slow down? Where does attention
  spike? Where do errors cluster?
</p>

<p>
  In a typical web application, the highest-friction moments are predictable:
  onboarding, form submission, error recovery, and loading states. These are
  the vestibules of the product — the thresholds users must cross to reach the
  value inside.
</p>

<pre><code class="language-ts">// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined { /* … */ }

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(\`User not found: \${id}\`);
  }
  return user;
}
</code></pre>

<h2>The paradox of ease</h2>

<p>
  Vivamus pretium aliquet erat. There is a paradox at the heart of "making
  things easy": it is very hard to do. Eliminating friction requires deep
  understanding of the user, the context, and the failure modes. It demands
  more work from the builder so that less work falls on the user.
</p>

<p>
  This is why ease is a form of generosity. Every unnecessary step you remove
  from your user's path is time returned to them — time they can spend on the
  thing that actually matters.
</p>

<h2>Facilisis in practice</h2>

<p>
  Donec aliquet metus ut erat semper, et tincidunt nulla luctus. Some
  principles I return to:
</p>

<ul>
  <li>Defaults should be correct for most users, most of the time.</li>
  <li>Error messages should explain what went wrong and how to fix it.</li>
  <li>The happy path should require no thought.</li>
  <li>Configuration should be possible, never required.</li>
  <li>Documentation is part of the product.</li>
</ul>

<p>
  Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam
  tincidunt tempus. The name of this principle — <em>nulla facilisi</em>, "no
  easy thing" — is a reminder that ease, properly understood, is never accidental.
</p>`;
};
