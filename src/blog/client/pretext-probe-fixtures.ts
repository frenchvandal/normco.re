import type { BlogStoryCard } from "../view-data.ts";
import type { SiteLanguage } from "../../utils/i18n.ts";
import type { PretextBrowserProbeSurfaceKey } from "./pretext-browser-probe-shared.ts";

type PretextProbeDiagnosticsCopy = Readonly<{
  actualHeightLabel: string;
  contentHeightLabel: string;
  deltaLabel: string;
  diagnosticKicker: string;
  diagnosticLead: string;
  diagnosticTitle: string;
  expectedHeightLabel: string;
  flaggedLabel: string;
  lineCountLabel: string;
  lineHeightLabel: string;
  maxDeltaLabel: string;
  minBlockSizeLabel: string;
  noMeasurementsLabel: string;
  pretextVariableLabel: string;
  runtimeDisabledLabel: string;
  runtimeEnabledLabel: string;
  sampleCountLabel: string;
  summaryLabel: string;
  titleLabel: string;
  widestLineLabel: string;
  widthLabel: string;
}>;

type PretextProbeSectionLabels = Readonly<
  Record<PretextBrowserProbeSurfaceKey, string>
>;

export type PretextProbeLanguageFixture = Readonly<{
  archiveSummary: string;
  archiveTitle: string;
  dateTooltip: string;
  diagnostics: PretextProbeDiagnosticsCopy;
  featuredEyebrow: string;
  featuredSummary: string;
  featuredTitle: string;
  gridAriaLabel: string;
  gridPosts: readonly BlogStoryCard[];
  outlineId: string;
  outlineTitle: string;
  pageKicker: string;
  pageLead: string;
  pageTitle: string;
  readingTooltip: string;
  sectionLabels: PretextProbeSectionLabels;
  signalTitle: string;
  storySummary: string;
  storyTitle: string;
}>;

export const PRETEXT_PROBE_LANGUAGE_FIXTURES = {
  en: {
    archiveSummary:
      "A compact archival note that still needs two or three wrapped lines on narrow screens.",
    archiveTitle:
      "Designing reliable text measurement for archive entries without brittle DOM reads",
    dateTooltip: "Published date",
    diagnostics: {
      actualHeightLabel: "Actual height",
      contentHeightLabel: "Content height",
      deltaLabel: "Delta",
      diagnosticKicker: "Diagnostics",
      diagnosticLead:
        "This panel compares the measured Pretext prediction with the live DOM box so we can spot drift before it turns into visual noise.",
      diagnosticTitle: "Predicted vs actual text metrics",
      expectedHeightLabel: "Expected height",
      flaggedLabel: "Over 1px",
      lineCountLabel: "Lines",
      lineHeightLabel: "Line height",
      maxDeltaLabel: "Max delta",
      minBlockSizeLabel: "Min block size",
      noMeasurementsLabel: "No matching text measurements were found yet.",
      pretextVariableLabel: "Applied variable",
      runtimeDisabledLabel: "Runtime hooks disabled",
      runtimeEnabledLabel: "Runtime hooks enabled",
      sampleCountLabel: "Samples",
      summaryLabel: "Summary",
      titleLabel: "Title",
      widestLineLabel: "Widest line",
      widthLabel: "Width",
    },
    featuredEyebrow: "Lead story",
    featuredSummary:
      "Pretext helps us keep editorial cards calm when titles and summaries expand differently across locales and breakpoints.",
    featuredTitle:
      "A restrained editorial layout can still benefit from precise multi-line measurement",
    gridAriaLabel: "Probe StoryGrid",
    gridPosts: [
      {
        dateIso: "2026-03-01",
        dateLabel: "March 1, 2026",
        readingLabel: "4 min",
        summary:
          "A brief note on making compact cards feel ordered instead of cramped.",
        title: "Why compact story cards still need stable text heights",
        url: "#pretext-grid-a",
      },
      {
        dateIso: "2026-03-02",
        dateLabel: "March 2, 2026",
        readingLabel: "6 min",
        summary:
          "Longer summaries are where row balancing starts to matter on editorial grids.",
        title:
          "Balancing rows matters most when a headline and summary both wrap unpredictably",
        url: "#pretext-grid-b",
      },
      {
        dateIso: "2026-03-03",
        dateLabel: "March 3, 2026",
        readingLabel: "5 min",
        summary:
          "Even a moderate card becomes visually noisy when neighboring items collapse to different heights.",
        title: "Predictable card rhythm beats perfect content symmetry",
        url: "#pretext-grid-c",
      },
      {
        dateIso: "2026-03-04",
        dateLabel: "March 4, 2026",
        readingLabel: "7 min",
        summary:
          "The useful metric is not raw height, but whether the row lands on a single shared rhythm.",
        title:
          "Measuring utility means comparing row rhythm, not just single-card height",
        url: "#pretext-grid-d",
      },
    ] as const satisfies readonly BlogStoryCard[],
    outlineId: "pretext-outline",
    outlineTitle:
      "Measuring section labels in a narrow outline rail without jumpy anchors",
    pageKicker: "Internal route",
    pageLead:
      "This probe mounts the real React editorial surfaces in a browser so Playwright can measure Pretext directly instead of inferring it from mostly static route HTML.",
    pageTitle: "Pretext Browser Probe",
    readingTooltip: "Estimated reading time",
    sectionLabels: {
      archiveItem: "Archive timeline item",
      featuredStory: "Featured story",
      outlineLink: "Outline link",
      signalStory: "Signal story",
      storyCard: "Story card",
      storyGrid: "StoryGrid",
    },
    signalTitle:
      "Signal lists need crisp titles even when the story itself stays short",
    storySummary:
      "A story card summary that is intentionally long enough to wrap in both mobile and desktop probes.",
    storyTitle:
      "Keeping card titles visually steady when the same content reflows across breakpoints",
  },
  fr: {
    archiveSummary:
      "Une note d'archive assez dense pour produire plusieurs lignes sur un gabarit étroit.",
    archiveTitle:
      "Concevoir une mesure de texte fiable pour les entrées d'archive sans lectures DOM fragiles",
    dateTooltip: "Date de publication",
    diagnostics: {
      actualHeightLabel: "Hauteur réelle",
      contentHeightLabel: "Hauteur du contenu",
      deltaLabel: "Écart",
      diagnosticKicker: "Diagnostic",
      diagnosticLead:
        "Ce panneau compare la prédiction Pretext à la boîte DOM réelle afin de repérer les dérives avant qu'elles ne deviennent du bruit visuel.",
      diagnosticTitle: "Métriques prévues vs réelles",
      expectedHeightLabel: "Hauteur attendue",
      flaggedLabel: "Au-delà de 1 px",
      lineCountLabel: "Lignes",
      lineHeightLabel: "Hauteur de ligne",
      maxDeltaLabel: "Écart max",
      minBlockSizeLabel: "Min-block-size",
      noMeasurementsLabel:
        "Aucune mesure de texte correspondante n'a encore été trouvée.",
      pretextVariableLabel: "Variable appliquée",
      runtimeDisabledLabel: "Hooks runtime désactivés",
      runtimeEnabledLabel: "Hooks runtime activés",
      sampleCountLabel: "Échantillons",
      summaryLabel: "Résumé",
      titleLabel: "Titre",
      widestLineLabel: "Ligne la plus large",
      widthLabel: "Largeur",
    },
    featuredEyebrow: "Article principal",
    featuredSummary:
      "Pretext nous aide à garder des cartes éditoriales calmes quand titres et résumés se développent différemment selon la langue et le breakpoint.",
    featuredTitle:
      "Une mise en page éditoriale sobre peut quand même profiter d'une mesure multi-ligne précise",
    gridAriaLabel: "StoryGrid de probe",
    gridPosts: [
      {
        dateIso: "2026-03-01",
        dateLabel: "1 mars 2026",
        readingLabel: "4 min",
        summary:
          "Une note courte sur la manière de garder des cartes compactes ordonnées plutôt que tassées.",
        title:
          "Pourquoi même des cartes compactes ont besoin de hauteurs de texte stables",
        url: "#pretext-grid-a",
      },
      {
        dateIso: "2026-03-02",
        dateLabel: "2 mars 2026",
        readingLabel: "6 min",
        summary:
          "Les résumés longs sont précisément l'endroit où l'équilibrage par rangée devient utile.",
        title:
          "L'équilibrage par rangée compte surtout quand titre et résumé reviennent à la ligne de façon imprévisible",
        url: "#pretext-grid-b",
      },
      {
        dateIso: "2026-03-03",
        dateLabel: "3 mars 2026",
        readingLabel: "5 min",
        summary:
          "Même une carte modérée devient visuellement bruyante quand ses voisines s'écrasent à des hauteurs différentes.",
        title:
          "Un rythme de cartes prévisible vaut mieux qu'une symétrie parfaite du contenu",
        url: "#pretext-grid-c",
      },
      {
        dateIso: "2026-03-04",
        dateLabel: "4 mars 2026",
        readingLabel: "7 min",
        summary:
          "La bonne métrique n'est pas la hauteur brute, mais le fait qu'une rangée retombe sur un rythme partagé.",
        title:
          "Mesurer l'utilité revient à comparer le rythme d'une rangée, pas seulement la hauteur d'une carte",
        url: "#pretext-grid-d",
      },
    ] as const satisfies readonly BlogStoryCard[],
    outlineId: "pretext-outline",
    outlineTitle:
      "Mesurer des libellés de section dans un rail étroit sans ancres qui sautent",
    pageKicker: "Route interne",
    pageLead:
      "Cette probe monte les vraies surfaces éditoriales React dans un navigateur afin que Playwright mesure Pretext directement, au lieu de l'inférer depuis un HTML public surtout statique.",
    pageTitle: "Probe navigateur Pretext",
    readingTooltip: "Temps de lecture estimé",
    sectionLabels: {
      archiveItem: "Entrée de timeline d'archive",
      featuredStory: "Article vedette",
      outlineLink: "Lien de plan",
      signalStory: "Lien signal",
      storyCard: "Carte d'article",
      storyGrid: "StoryGrid",
    },
    signalTitle:
      "Les listes signal ont besoin de titres nets même quand le contenu reste bref",
    storySummary:
      "Un résumé de carte volontairement assez long pour revenir à la ligne dans les sondes mobile et desktop.",
    storyTitle:
      "Garder les titres de cartes visuellement stables quand le même contenu se recompose selon le breakpoint",
  },
  zhHans: {
    archiveSummary:
      "这是一段用于归档条目的摘要文本，它在较窄宽度下仍然需要稳定的多行节奏。",
    archiveTitle: "在不依赖脆弱 DOM 读数的前提下，为归档条目建立可靠的文本测量",
    dateTooltip: "发布日期",
    diagnostics: {
      actualHeightLabel: "实际高度",
      contentHeightLabel: "内容高度",
      deltaLabel: "偏差",
      diagnosticKicker: "诊断",
      diagnosticLead:
        "这个面板会把 Pretext 的预测结果和真实 DOM 盒模型进行对比，帮助我们在视觉噪声出现之前发现偏移。",
      diagnosticTitle: "预测值与实际值对照",
      expectedHeightLabel: "预期高度",
      flaggedLabel: "超过 1px",
      lineCountLabel: "行数",
      lineHeightLabel: "行高",
      maxDeltaLabel: "最大偏差",
      minBlockSizeLabel: "最小块尺寸",
      noMeasurementsLabel: "暂时还没有找到匹配的文本测量结果。",
      pretextVariableLabel: "已应用变量",
      runtimeDisabledLabel: "运行时 Hook 已禁用",
      runtimeEnabledLabel: "运行时 Hook 已启用",
      sampleCountLabel: "样本数",
      summaryLabel: "摘要",
      titleLabel: "标题",
      widestLineLabel: "最宽行",
      widthLabel: "宽度",
    },
    featuredEyebrow: "主打文章",
    featuredSummary:
      "当标题和摘要在不同语言与断点下以不同方式换行时，Pretext 可以帮助编辑卡片保持稳定。",
    featuredTitle: "克制的编辑布局同样可以从精确的多行文本测量中受益",
    gridAriaLabel: "Probe StoryGrid",
    gridPosts: [
      {
        dateIso: "2026-03-01",
        dateLabel: "2026年3月1日",
        readingLabel: "4 分钟",
        summary:
          "这是一条简短说明，用来观察紧凑卡片在有限空间中的节奏是否稳定。",
        title: "为什么紧凑的文章卡片仍然需要稳定的文本高度",
        url: "#pretext-grid-a",
      },
      {
        dateIso: "2026-03-02",
        dateLabel: "2026年3月2日",
        readingLabel: "6 分钟",
        summary: "当摘要变长时，同一行卡片之间的平衡才真正开始体现价值。",
        title: "当标题与摘要都可能意外换行时，按行平衡才真正重要",
        url: "#pretext-grid-b",
      },
      {
        dateIso: "2026-03-03",
        dateLabel: "2026年3月3日",
        readingLabel: "5 分钟",
        summary:
          "相邻卡片如果收缩到不同高度，即使内容不多，视觉节奏也会变得杂乱。",
        title: "可预期的卡片节奏，比内容绝对对称更有价值",
        url: "#pretext-grid-c",
      },
      {
        dateIso: "2026-03-04",
        dateLabel: "2026年3月4日",
        readingLabel: "7 分钟",
        summary:
          "真正有意义的指标不是原始高度，而是同一行是否最终落在统一节奏上。",
        title: "评估价值时，更应该比较一整行的节奏，而不是单张卡片的高度",
        url: "#pretext-grid-d",
      },
    ] as const satisfies readonly BlogStoryCard[],
    outlineId: "pretext-outline",
    outlineTitle: "在狭窄提纲侧栏中测量章节标签，同时避免锚点发生跳动",
    pageKicker: "内部路由",
    pageLead:
      "这条 probe 路由会在真实浏览器中挂载真正的 React 编辑组件，让 Playwright 直接测量 Pretext，而不是仅从大多静态的公开页面 HTML 推断其效果。",
    pageTitle: "Pretext 浏览器 Probe",
    readingTooltip: "预计阅读时间",
    sectionLabels: {
      archiveItem: "归档时间线条目",
      featuredStory: "主打文章",
      outlineLink: "提纲链接",
      signalStory: "Signal 条目",
      storyCard: "文章卡片",
      storyGrid: "StoryGrid",
    },
    signalTitle: "即使文章本身较短，Signal 列表也需要保持清晰稳定的标题",
    storySummary:
      "这段卡片摘要故意写得更长，以便在移动与桌面探针中都出现多行情况。",
    storyTitle: "当同一内容在不同断点下重新换行时，如何保持卡片标题的视觉稳定",
  },
  zhHant: {
    archiveSummary:
      "這是一段用於歸檔條目的摘要文字，在較窄寬度下仍然需要穩定的多行節奏。",
    archiveTitle: "在不依賴脆弱 DOM 讀數的前提下，為歸檔條目建立可靠的文字測量",
    dateTooltip: "發佈日期",
    diagnostics: {
      actualHeightLabel: "實際高度",
      contentHeightLabel: "內容高度",
      deltaLabel: "偏差",
      diagnosticKicker: "診斷",
      diagnosticLead:
        "這個面板會把 Pretext 的預測結果和真實 DOM 盒模型進行對比，幫助我們在視覺噪音出現之前發現偏移。",
      diagnosticTitle: "預測值與實際值對照",
      expectedHeightLabel: "預期高度",
      flaggedLabel: "超過 1px",
      lineCountLabel: "行數",
      lineHeightLabel: "行高",
      maxDeltaLabel: "最大偏差",
      minBlockSizeLabel: "最小區塊尺寸",
      noMeasurementsLabel: "暫時還沒有找到相符的文字測量結果。",
      pretextVariableLabel: "已套用變數",
      runtimeDisabledLabel: "執行期 Hook 已停用",
      runtimeEnabledLabel: "執行期 Hook 已啟用",
      sampleCountLabel: "樣本數",
      summaryLabel: "摘要",
      titleLabel: "標題",
      widestLineLabel: "最寬行",
      widthLabel: "寬度",
    },
    featuredEyebrow: "主打文章",
    featuredSummary:
      "當標題與摘要在不同語言與斷點下以不同方式換行時，Pretext 可以幫助編輯卡片維持穩定。",
    featuredTitle: "克制的編輯式版面，同樣可以從精確的多行文字測量中受益",
    gridAriaLabel: "Probe StoryGrid",
    gridPosts: [
      {
        dateIso: "2026-03-01",
        dateLabel: "2026年3月1日",
        readingLabel: "4 分鐘",
        summary:
          "這是一段簡短說明，用來觀察緊湊卡片在有限空間中的節奏是否穩定。",
        title: "為什麼緊湊的文章卡片仍然需要穩定的文字高度",
        url: "#pretext-grid-a",
      },
      {
        dateIso: "2026-03-02",
        dateLabel: "2026年3月2日",
        readingLabel: "6 分鐘",
        summary: "當摘要變長時，同一列卡片之間的平衡才真正開始顯現價值。",
        title: "當標題與摘要都可能意外換行時，按列平衡才真正重要",
        url: "#pretext-grid-b",
      },
      {
        dateIso: "2026-03-03",
        dateLabel: "2026年3月3日",
        readingLabel: "5 分鐘",
        summary: "相鄰卡片若縮到不同高度，即使內容不多，視覺節奏也會變得混亂。",
        title: "可預期的卡片節奏，比內容的絕對對稱更有價值",
        url: "#pretext-grid-c",
      },
      {
        dateIso: "2026-03-04",
        dateLabel: "2026年3月4日",
        readingLabel: "7 分鐘",
        summary:
          "真正有意義的指標不是原始高度，而是同一列是否最後落在統一節奏上。",
        title: "評估價值時，更應該比較一整列的節奏，而不是單張卡片的高度",
        url: "#pretext-grid-d",
      },
    ] as const satisfies readonly BlogStoryCard[],
    outlineId: "pretext-outline",
    outlineTitle: "在狹窄提綱側欄中測量章節標籤，同時避免錨點發生跳動",
    pageKicker: "內部路由",
    pageLead:
      "這條 probe 路由會在真實瀏覽器中掛載真正的 React 編輯組件，讓 Playwright 直接測量 Pretext，而不是只從大多靜態的公開頁面 HTML 推斷其效果。",
    pageTitle: "Pretext 瀏覽器 Probe",
    readingTooltip: "預估閱讀時間",
    sectionLabels: {
      archiveItem: "歸檔時間線條目",
      featuredStory: "主打文章",
      outlineLink: "提綱連結",
      signalStory: "Signal 條目",
      storyCard: "文章卡片",
      storyGrid: "StoryGrid",
    },
    signalTitle: "即使文章本身較短，Signal 清單也需要維持清晰穩定的標題",
    storySummary:
      "這段卡片摘要刻意寫得更長，讓它在行動與桌面探針中都產生多行情況。",
    storyTitle: "當同一內容在不同斷點下重新換行時，如何維持卡片標題的視覺穩定",
  },
} as const satisfies Record<SiteLanguage, PretextProbeLanguageFixture>;

export function getPretextProbeLanguageFixture(
  language: SiteLanguage,
): PretextProbeLanguageFixture {
  return PRETEXT_PROBE_LANGUAGE_FIXTURES[language];
}
