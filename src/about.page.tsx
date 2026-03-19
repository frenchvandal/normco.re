/** About page - prose introduction. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";
import {
  getLocalizedAtomFeedUrl,
  getLocalizedJsonFeedUrl,
  getLocalizedRssFeedUrl,
} from "./utils/feed-paths.ts";
import {
  type CarbonIconDescriptor,
  CLOSE_ICON as CARBON_CLOSE_ICON,
  DOWNLOAD_ICON as CARBON_DOWNLOAD_ICON,
  LOCATION_ICON as CARBON_LOCATION_ICON,
  NOTEBOOK_ICON as CARBON_NOTEBOOK_ICON,
  TRANSLATE_ICON as CARBON_TRANSLATE_ICON,
} from "./utils/carbon-icons.ts";
import { escapeHtml } from "./utils/html.ts";

const LAO_YANG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="281 34 587 774" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="m560 729 18 45-11-31Zm56-6 9 26v3l7 19v2-3l-7-20-3-13Zm12-17 6 11-1 9 4 16 3 3h6l2 2 9 17 11 15-17-28-7-15-8-11-1-8-4-8Zm10 30 4 1v5l-2 1-3-4Zm124-62-4 1-2 4-1 6v9l1 4 3 4h2l3-3 2-8v-10l-2-5Zm-1 3 3 4v7l-2 7-4 1-1-2v-6l2-1-1-6 1-4Zm-203-11 16 6 9 5 6 2-18-9Zm210-13-1 1 5 4 2 5v35l-2 21v17l1 16 4 22 3 8-1-2v-5l-2-6-2-17v-48l4-27 12 24 4 11 10 21 2 2v2l2 2 3 8 18 33-6-15-14-29-3-4v-2l-4-6-15-33-12-22v-6l-2-5Zm-28-6v3l4 5 7 4 10 4 4 3-3-4-4-2-5-1-5-3Zm66-3 5 15 8 19 9 27 16 57 8 22v-3l-1-1-2-8v-4l-19-66-13-35Zm-354-20 7 14 19 31 17 35 10 25 18 56-2-7v-4l-7-25-8-24-12-29-15-29Zm212-2-6 9-6 4-5 1h6l4-2 5-6Zm-38-51 4 1 3 2h3l3 2 11 2-10-2-3-2h-3l-3-2Zm-77-16 16 15 21 14 26 12 9 3 7 1-15-4-28-13-23-16Zm-6-47 6 8 18 18 19 13-19-14-22-22Zm25-19 10 10 8 6 12 7 28 12 14 3 1 1h3l-9-3-28-12-20-10-8-5Zm109-51-1 10 3 19v-5l-1-1-1-8Zm57-40-1 2v9l2 3-1-2Zm15-4v7l2 6-3 7-4 1-5 4h-3l-1-1-6 1-12 6-22 16-6 7-1 5h4l6 3 17 3 14-1 7-3 4-4 1-3-1-11 2-9 4-2 3-3 3-8v-6Zm-55 57 9-1 4-3 12 2-1 7h-16l-4-1Zm42-5-6 7-2 1-2-1-2 2h-4l-1-5 2-2 7-1 5-3Zm5-15v2l-3 7-4 4-7 3-5 1-2-2h-2l-2 2h-5l-3-2-3 3-7-1v-3l2-2 5-2h3l3-3 4-2 4 1v2l1-4 3-1 7 1v2l1-5h4l3-2Zm10-15-1 4-6 6-9 5-13 2-9 3-15 7h-4l2-2 9-5 7-6 16-10 4-1h9l5-4Zm-11-31-2-1h-7l-4 1-6 3-3 3v2l8-4 9-2h5Zm-38-2v5l4 6 2 1 8-1h-5l-4-2-4-4Zm-1-11-16 31-5 13-1 6 6-15 9-17 4-12Zm-63-27-13 10 9-6Zm44-21-8 5-10 3-8 4-9 6-5 5 12-9 10-5 5-1 10-5Zm12-7-3 9-5 9 6-9Zm-77 0 11 3h10-7l-10-2-1-1Zm131-11-5 2h-11l2 1h7l4-1Zm-59-4-2-1-9 4-21 16-14 7-35-2 12 2h12l3 4-9 3-10 2h-8l4 1 9-1 11-3 8-4 8-2 6-3 9-7 4-2 16-4h3l1-2 2 1-4-6Zm-6 4 2 1 1 4-5-1Zm11-15-1 20v-4l1-1Zm24-10-2 7v9l3 9 6 10 10 12 8 14 9 11 3 5 3 8v8l-3 6-6 7-9 6 8-3 7-6 4-8 1-8-2-8-3-6-12-15-9-15-8-9-7-11-2-8Zm-339-20 3-2-3-3v-3l-1 6Zm14-15h-6l-11 4 12-4ZM646 73l-20-6-9-5-8-2-5-5-4-2-12-3h-7l-8 1-17 6-27 14-6 5-3-2 6-8 14-8 9-3h-2l-16 7-3 3-4 2-3 4h-2l-6 6-3 5-17 13-11 5 2-8 5-10 4-6 6-6v-1l10-9 14-7-6 2-8 5-14 13-6 8-9 20-22 10-3 4h-4v5l-8 7-11 18v2l-5 8-1 7-4 4-2 5-2 12h-2l-8-4-5-1h-9l-5 2-3 3-2 5-3 1 2 1-1 6-10 2-9-7-6-6v-3l-19-2-7-3-2-2v3h3l8 6 7 7 11 8 9 5 8 3 9 2 2 2-1 5h-16l-1-1h-5l3 3-10 4-4-2 2-2h-2l-1 1h-6l-1 2h-5l-1 1h-2l-1 3h4l5-2 8 2-9 11-8 5 4 1-2 2-2 5 1-3 12-12 8-2v-2l2-2 10-4 7-1 4 3-11 3-6 3-17 12-11 18-1 5 4-9 5-7 15-14 7-4 14-1 4 2v3l2-1 9 1 13 5v2l-10 9-1 3-4 4-4 1 7-2 2 2v5l-4 4-4 2-8-2-5-3-5-6 7 8 5 3h3l2 3-4 5-1 4 2 5-1-2v-5l1-2 6-5 4 1v7l3 11-4 4h-3l-4-2 6 4-4 5-2 7 2-6 3-5 3-3 5 1 1 3-1 21 6 5 1 3 4 4v19l4 14 7 12v4l2 5 2 1 1 2 3-1 1 6v11l3-8 7 16 3-1 6 10 3 12v6l3 2 1 5 3 3v3l2 2 3 1v2l3 5v14l3 4 2-3 6 7v3l-9 17-4 5-5 9-5 15v8l-1 4-10 15-3 12-24 26-47 48-27 37-18 30-20 41-8 22 5-10 2-2 4-10 2-2 8-18 18-34 10-16 9-11 9-14 10-13 50-51 14-17 6-3v4l5 15 7 15-4 3-5 1-5 6-3 6-4 12-8 17-26 34-27 48-12 25 11-22 15-25 9-18 13-19 11-12 4-6 8-15 9-23 6-7 10-3 7 12 27 29 13 18 1 3 12 17 19 22 7 5 13 5h15l14-4 4 1 3 6v2l8 17 3 4 9 20 8 20v-3l-9-24-12-26-6-11-2-2-1-6 13-4 2 5 4 18 12 34-14-47-4-9v-3l13-9 11-6 13 16 2 4 2 8 5 8 6 17 18 27 6 11 2 1-3-7-7-12-10-14-6-12-5-14-3-3 1-4 19 8 11 12 6 3 5 1 6 4h2l4 5 6 12 3 13 3 7-1-11-2-8-3-6-2-23 1-14h10l5 2-3 23-2 4v13l-2 2 2 6 2-17 3 1v5l-1 2 1-7 4-1v9l-2 3v5l1 1v2-4l3-4-2-2v-5l1-3 2-1 1-2-1-7 3-16 3-6 5 2-2 14-4 12-3 17v13l1-5 1-1v-6l2-11 6-22 4-30 3-13 10 38 7 18v3l8 22 3 6v-4l-3-8-3-13-1-9v-58 7l-1 1 1 45-3 5-16-52-1-5v-14l-2-9v-9l-4 5-7-25-3-6 1-6 13 11 13 7 5 1-3-2-4-1-10-6-18-17-14-33-10-19-9-14v-3l5-8 7-7 3 1 27 29 22 28 13 13 3 4 1 5-9 4-4 3-7 9-1 4 1-3 5-7 4-4 9-5 5-1 6 9h-2l-6 3-5 4-6 7-1 5 11-12 3 1 4 5 5 3h5l6-2 8-7 1-2v-4l-2-2-7-3v-3l-6-15-11-14-16-11-25-11-23-24-8-6v-3h2l8-4 14-4 9-6 6-7 2-4 3-11v-12l-3-12-1-18 4-30v-19l3-19 6-18 2-10v-18l-3-16-3-9-8-14-3-9v-7l2-2 1-4v-10l-5-16 2-3v-3l2-2v-3l-3-7-2-3-2-1 1-10-2-34-10-29-11-19v-3l-4-7-9-9-10-7-16-8-4-4-7-4-4-4-1-3-7-9v-6l5 5-5-5-3-1-4-4Zm77 673v5l-4 6v-5Zm6-16 2 1 1 4-4 22-4 1v-18l-3 4v-4l3-10Zm10-22 4 1-2 20-2 2-5-1 1-11Zm-8-3 5 2v6l-3 15-2 2h-2l-5-2 4-19Zm-95 1 2-2 7 4 12 10 16 8 14 14 2 6h-2l-6-3-8-8-2-4-25-9-4-9Zm107-6 1 2-1 4h-4v-3Zm-33-1h3l4 2h4l6 2v3l-1 1-2 10v5l-2 6-10-1-6-2v-11l1-7Zm-186-11 5 4h2l6 5 2 5v6l1 3-1 3-7-7-9-15 2 2 3 1-6-5Zm211 0h3l2 6v3l-3 8-6-1 1-7 1-2 3-2Zm-22-1 3-1 15 6v2l-3 7-3 1-1-1h-3l-10-4v-5Zm34-2-1 9-4 3v-8l2-4Zm-28-13h3l3 2 8 8v7l-6 1-3-2-5-1-4-2-1-2 3-5Zm24 0 2 5v4l-4 6h-4l-1-6 4-9Zm-15-22 5 6 6 10-1 6-3 6-3 2-8-7-3-1-1-4 1-6 3-2 5 5 1 3 3 3-9-15v-2l2-3Zm-24-3 6 6 7 5 2 3-8 19h-3l-1-12-2-10-3-8Zm17-5 5 6v2l-3 7h-4Zm-21-8 16 1 1 2-2 17-2-1-5-6-5-4-4-6Zm84 0h5l-2 9-5-8Zm6 10v-15l1-3 13 3 5 4v3l-5 5-9 4Zm-89-26 10 11v4l-6 1-7-1Zm-11-12 7 8-1 9 1 5-2 3-2-2-7-13v-2l2-2Zm-6-9 3 5v5l-1 2h-3l-2-5Zm64-17 2-2 3 2h2l16 8 11 8 10 11 8 20-11-1-2-1-8-8-9-12-8-8Zm-55-15 4-1 18 34 11 25 8 24-1 6-25-31-10-10-16-20v-7l1-3Zm-187-33 3-1 26 38-1 4-11-14-3-6-5-6Zm-23-60 5 4-1 12 1 7 4 13 5 12 12 22 20 29 27 33 16 18 19 25 6 9 5 10 17 24-5 1-10 5-10 7-13 6-13 3h-11l-1-1h-4 2l1 1h17l5-1 11-4 18-11 13-6h2l4 4 2 3-1 3h-4l-8 4-15 10-6 3-16 5-6 1h-12l-11-4-4-4-2-4-2-12-2-4-5-4-7-2-8-8-18-29-9-11-7-6 8 8 8 10 17 28 5 5-2 3-6-6-20-29-27-28-7-10-9-18-6-18-1-9 2-7 3-5 4-1-1 4 1 10 7 23 13 28 3 3-2-2-14-30-7-24v-12l3-8 1-12 3-10 5-10 6-9 3-8 8-13 3-7-6 3 1-7h2Zm-6-81 1 2-1 6-2-4v-2Zm-35-8 3-1 5 9 7 8 3 5-2 3-8-10Zm7-15 1 3-1 4-3-6Zm60-10v4l-2-2Zm36-11 1 5 1 1-3 2-2-7Zm-36-1v4l-2-2Zm21-6 1 6 2 4-3 2-2-9-1-1Zm-116-5h3v12l2 18 1 1-3 6-4-11v-24Zm140-15 3 3 2 4 4-6 2 8v6l1 1-1 6-5-1-1-4v6l2 5-3 2-4-9-2-9Zm-120-2 3 12-3 3-3-9Zm113-1 1 5 1 1-3 2-2-7Zm-58-1-1 8-3-1v-2Zm-77-5v1h-3v-2Zm122-4 1 5 2 3-3 2-3-8Zm-23-2h3l2 9-3 15v-5l-2 4-3-1-2-7v-4Zm-101 0v2l-2 3-2 10-3 4-2-2v-7l2-7 3-3Zm156-1v2l-4 4v-3Zm-114-1 1 6-3 14-1-7Zm13-5 3 8 3 2v5l2 7v6l3 5-1 4-2 3v3l-3 4-2-2v-4l-3-10 3-5 1 6 2 4-2-14-2-6-2-3-3-10Zm-37 0v2l-3 4-2 6h-3v-4l4-7Zm302-3-1 3-5-1 1-2 3-2Zm-213-1 2 9 1 1-3 2-3-9Zm-74-4h3l-3 11v14l2 5-1 7 1 1v3l5 14 2 9-3-3-2-5-5-7-4-16-4-10 1-7Zm-23 1-2 2-1 3h-4l2-2 1-3Zm150-2v4l-2 6-4 3 2-11 1-2Zm-105-2 3 6 1 7 1 1-3 3v-3l-5-12Zm-44-4-3 3-1 3-5 7-6 3v-2l6-11 5-4Zm101-4 2 2 5 10v2l-2 2-2-4 1 8-3 2-3-12Zm-112 0v2l-3 4-6 3-1-3 1-8h3l1 1Zm-5-3 1-2 6 3Zm107-6 2 6-1 6-3 5-3 2Zm-111 0 2-2h3l2 2-1 3h-4Zm89-3 1 2-3 6v-4l-1-1Zm-29-4 9 8 5 9 1 5 3 5 1 14-3 6-2-10-6-16-10-18Zm-57 3 6-4h5l2 1v3l-4 2Zm36-6 2 6v5l-4 13-5 10 3-1-1 7-4 3 1-6-3 1v-5h-4l12-21 1-8-3 1-2 2-3 6-4 2-3 3h-4v-2l3-4 10-9Zm-43-1h3l-1 4h-3Zm185-3 3 1 1 4v14l-1 2-5 2v-15Zm78 1-8 12h-3l-6 2 1-2Zm-180-3 4 9 4 14v9l-4 1v-5l-5-14-2-9Zm20-1 5 8 2 8v12l-4 1-1-12-5-16Zm194-1v8l-2 2-4-2 2-3 1-5Zm-253-2 5 5 1 3-2 1v8l-3-3-3-9Zm54-2 2 2-3 3Zm-87 2-5 4-8 2 1-2 9-6Zm132-5 3 9 5 8v5l-2 6-3 19v-23l-4 7 1-21-3-9Zm207-2 2 2v2l-4 1Zm-261 0h2l3 3 3 8 2 9-3 3v-2l-4-8-1-5-2-3Zm-71 3-2 2-5-1 5-4Zm22-6 2-2h2l14 10 14 14 2 5v4l-9-10-10-7-11-6-4-4Zm65-5 9 9 1 3 2 1 2 4 1 7-3 16-2-6v-5l-11-20 2-1-3-6Zm-60 0 10-1 12 2 17 5 2 8 3 6-3 2v-2l-6-9-6-3-2 3-1-2 5 10 1 5-2 2-2-4-13-12-8-5-6-1Zm-29 1 4-2 3 5h-4Zm178-3 2 10v6l-2 11-3 4-2-2v-20l1-8Zm-56-2 7 5 7 7 8 11 7 15v5l-1 5-4 3-1-4v-8l-2-4h-1l-1-3v3l-4 4v-16 3l-4 1-6-15-7-9Zm-134 0 2-1 6 2 1 3-1 5-10-2-1-2Zm121-2 12 13 2 5-2 15v11l-1 2h-3l-2-7-4-26-3-10Zm-146 0 5-1h10l8 1 2 3-3 4-4 1-1-1h-4l-10-4Zm304-5 1 6 4 11 3-1 2 14-2 6-2 1h-4l-4 3h-6l-6 3-4-1-6 2v-2l8-16 6-9 7-17Zm-317 1-7 3-3 3-5 1v-2l7-7 4-1Zm297-3v11l-6 11-2-2v-2l4-9v-4Zm-187-4 5 1 7 4 6 10-17-11-2-2Zm-109 2 1-2 15 3Zm57 0 3-2v2l5 8 5-4v-2l2-2h3l3-2h8l4 2-1 3h-7l-8 3-3 3 15-4h11l9 2 4 3 6 2 3-2 13 10 4 5-2 3-2-3-7-5h-6l-11-4-14-3-22 1-2-2v2l-2 2-3 1-3-1-1-2v-7Zm289-4 1 7-1 8-3-1-1-4v-7Zm11-1 2 12-3 2-2-8Zm-305 0v4l-3-1Zm323-1 2 12v8l1 1v7l-5 9-3 2-2-2-4-11 1-12 4-4 1 2v4-4Zm-352 1 1-3h7l5 4Zm257-4 3 3 2 9v8l-1 5-4 3 1-13-3-13Zm-22-2 11 13 5 12 1 5-1 4-3 7-3 4 4-5 3-7h3v5l-8 17-10 10-9 4 2-1 5 2-4 3 3-1 11-9 6-1v2l-2 2v5l-5 9 4-4 5-9 3-1 4-4 4 1-8 12 10-10 10-1 10 1 3-2h3v-3l4-4 3-1 2-2h5l3-4 2-7v-22l-2-6 3-2 5 18v19l-4 14-4 6 3-4 3 2 2-3 1-6 2-3 2-7 5-28 2 2 3 6v20l-2 10-2 5 4-8 4-5-1 10 1-7 4-4v10l3-3 2 1 5-5 10-1 1 8 3 7-2 15-5-4h-8l-3 1-8 6-2 4-1 5 8-4 9-1 10-3v8l2 3v3l8 14 6 24v20l-2 10-6 19-2 13v13l-2 23-3 9-2-2-1-4-3-5v2l4 8v12l-1 2-5 4-8 3h-11l-9-3-11-6-2-2 4 4 9 5 10 3h10l6 1-17 6 2 1h9l3-1 5-5 1-5 7-4 1 13 3 13v10l-2 8-4 8-9 8-8 4-10 3-13 2h-12l-14-3 2 1 3 4h-9l-9-2 9 3 27 3-7 8-3 7-7 12-14 19-4 9v2l-3 5 2-1 7-13 4-1-1 13-2 11v20l2-20 4-4 1 5 2 2 11 23 6 20 3 16v20l-2 8-1 11 1 24 2 11-2 7-10-13-21-20-13-6-10-8-19-12-19-21-8-11-5-10-13-19-28-35-3-6-5-6-18-29-14-19-16-24-9-18-4-15 1-7 2 2h2l-2-5 2 1-2-2v-5l5 4-3-5 2-3 4 3 1-3-5-6 1-4 3 2 4 1-6-7 2-2h2l-3-11 3 2-2-3 1-2-3-4 1-4 8 7 5 3 6 2h7l5-2h4l2 2 6 17v-4l-1-1v-5l-4-10-6-1-7 2h-4l-9-3-15-14-9-12-4-9-10-33v-17l1-3 5-9 4-1v3-5l4-1 3 5v2l-2 2h-2l-6 7-2 4v7l8 31 5 9 6 6 4 2-10-10-5-12-1-4v-12l2-10-1-5v9l-4 5-2-10-1-1 1-5 4-7 4-3h6l2 2 2 10v-2l-1-1 1-7 4 6 1 5 5 6v2l-2 2-8 4-4 5v10l3 8 8 7 3 1h6l11 5 5-1 2 2 1 3-1-5-2-4-7-7-2-4 1-13-2-4-4 5 3-1 2 3-1 11 1 3 7 10h-3l-8-4h-11l-7-8-3-8v-8l2-2 5-2 6-7h3l1 2v9l1-2v-8l-1-3 1-3 7 4-8-10 3-2 1 2v-2l-2-4 3-2 1 5 4 6 3 1 8 10-2-5-2-2v-6l4 5h2l2 2 1 3 4 5v2l3 5 9 10-1-5h2l6 5v-4l3-2h3l2-3 4 5 2-2v-5l-2-11 5-3 1 2-3-8-1-12-2-4 3-7 1 4 3-4 1 2-3-8-1-7 3-6 2 4-3-10-1-14 2-8 7-10 1-3h3l-1 7-4 10v2l5-13 6-25 1-15-1-10-2-9-1-1 2-3 2 2 6 14 1 8-1-11-3-8 1-5 9 1 3 1 3 3-1 14-4 14-5 9 4-5 3-7 3-10 2-14h2l4 5 2 6 1 8v-4l-1-1v-4l-2-6-6-11Zm-121-2h11l8 4 17 11 4 8-4-1-11-7-6-5-20-8Zm173 0-1 16-2 9-7 16h-3v-2l2-3 4-13 3-20Zm-130-2 2 1 8 9-2 3-10-11Zm98-4v2l2 3-3 2-2-5Zm-20 0v6l-3-4Zm-232 5 4-4 5-2 10 1 4 3v3l-3 2-3-3-4-2h-3 2l7 4 2 3-2 2h-3l-10-3h-4l-2-2Zm164-9 3 3 4 8 4 12-3 3-3-6-5-15-2-3Zm150-2 3 4-3 11-2-11Zm-241 2 7-3h9l2 3-2 2 2-1h10l6 2 3 2v3h-5l-8 3h-4l-10-6 4 4 6 4 5 2 1 3 7 2 10 7 11 12 6 10 2 6 1 10 1 1-3 4-4-15-4-8-2-2-2-4v-2l-1 8-2-4-7-7-17-14-14-6-10-1-7-4 8-4-5-1Zm145-5h2l6 6-2 3-7-7Zm-43 0 8 6v5l-10-9Zm134-1 3 11-3 5-1-8-2-5Zm-143-1 6 4 16 15 8 12 3 7-3 12-4 5-3-20-2-7-3-5 3 7 4 20v9l-7 16-3-1-9-26 2-7 2 4v2l5 9 2 8-1-10-9-34 2-2 7 10-2-5-6-9-10-12Zm-137 1v2l-3 7h-3v-2l3-7Zm96-1h2l12 7 26 25 5 13-2 3-4-6-13-12-11-14-13-12-4-2Zm-24 0 17-1 10 7 12 12 4 11-5-4-8-4v-3h5l-7-3h-9l-5-1-1-2-10-5-4-4Zm221-2 3 6 3 13-2 3-2-2-5-18Zm-260 1 4-1v2l-2 3 1 6-2 3v5l-2 4-7 3 2-1h12l4 2 2 3 3 1-1 3-9-4-6-1-11 1-2-2 2-7 4-1 2-9Zm135-6 15 9 14 13 2 6-1 5-15-1-3-3-7-16-7-11Zm-171 6v2l-5 10-7-2-9 1-3 2-3 5-2 1-11-8v-3h4l5-2 1-5 3 3-2-3 1-5 2-1 10-1 5 1 4 2-1 3-12 6h4l2-3 9-4Zm271-6 7 16-3 2-7-16Zm-289-1 1-2h5l5 1 8 4-1 3-8-4Zm-60 0 2-2 17 3-2 5-2-1 4 3 3 1 3 3 4 1 12 9v3l-8-2-15-8Zm163-5h21l3 1 1 2 2 1h4l5 3 9 10 8 13-2 3-32-22-20-8Zm88-2 5 1 6 3-1 3-5-3-6-2Zm-136 0v2l-6 7h-2l-2 2-1 3h-3v-4l1-2 8-7Zm49 0-2 2-8 4-6 1-4 4-5 3-12 1v-2l14-14 5 2-9 8 5-2 6-4 6-1 6-3Zm73-1 1-2h2l4 3-3 2Zm121-3 4 4 5 9v4l1 1-3 3-7-17-2-2Zm-192 3 6-3 8-1h13l5 2 12 1 12 3 10 4 7 5 9 9 2 7-12-12-8-5 1 2 6 4 12 13 3 5 3 9v3l1 1-3 2-5-11-7-11-9-9-10-6-21-9-11-3h-7l-9 2Zm156-6 5 6 3 7-3 2v-2l-2-4-5-7Zm-235 0-1 16-3 2-2-2 1-12 2-4Zm9-2v6l-3 3-3-1v-5l3-3Zm282-2 6 11 3 9 2 12-3 12-2-17-8-25Zm-278-1 1 3-5 2v-4Zm99-3 13-1 9 2 5 6 5 2 4 3 4 5 1 6-6-6-6-4-19-8-8-1-2-1Zm106-5 3 2 7 8 10 18 2 10-3 17v-5l-6-21h-2l-2-2-4-13-7-12Zm-49 0h2l7 3 16 9 9 9 9 12 4 8-3 3-6-10-18-18-8-6-12-7Zm20-2 6 4 8 8 6 9 4 8-3 2-3-5-10-11-1-3-3-4-6-6Zm86-4 7 7 5 9 3 10-2 2-10-19-5-7Zm-142 3h2l2-2 4-1h12l14 5v2l4 4 12 9 2 6-7-5-5-2-2-2 8 7 4 2 10 9 12 9v5l-5-4-8-4-15-15-18-10-8-2-3-4h6l7 2-11-4-6-1h-10Zm65-5 8 3h4l4 4 2 4 2 7-1 4-3-6 2 3 3 13 6 14-3 3v-2l-2-3-4-13-4-8-16-21Zm-151 2-3 4-10 5-2 2-4-1 7-8 6-3Zm111-1 1-2h12l7 2 14 13-2 3-5-4-16-8-5-1Zm-141-2-2 5v4l-1 2-5 2 1-8 3-5Zm218-5 5 3 20 19 5 7 2 4-1 4 4 9-3 3-6-13-5-8-3-3-5-9-10-11-4-2Zm33-7 12 12 2 7-16-17Zm-239 1v2l-3 6-3 3-2 7-2 3-4-1 3-12Zm127 6-5 1-25-3 6-1 10-5h3l11 5Zm-5-9h8l10 2 18 7 3 2 9 10v5l-9-8-9-5-16-4-14-6Zm-24 3-8 2-10 4-15 9-3 1-4-1 19-13 6-3 8-2Zm-54-1-6 8-13 8-13 11-13 7-3-1 1-3h2l5-4 10-5 4-4 2-3v-2l2-2 13-8-1 3 2-2Zm174-6 2-2 14 9 8 8-1 4-18-14Zm-202 0-3 6-5 6-2 5-6 3v-2l5-7v-2l3-5Zm8-1-2 3-3 2v-2l2-4Zm113-1h6l4-1 2-2h16l6 4 13 4 6 3 12 8 12 14 6 9 4 8 3 9-3 4-3-6-3-3 5 9 3 11-2 7-2-2-1-7-4-8-3-11-2-4-7-10-11-11-21-16 7 8v4l-5-1-22-12-10-4h-3Zm-139-3v4l-7 7-5 1 1-4Zm179-4h5l16 3 19 6 2 6h-2l5 3 15 14 8 11 3 7v2l-2 2-12-17-5-5-14-11-16-9-12-4-4-3h-2l-4-2Zm-156 1 1-3 3 2Zm144-4v4l-2-2Zm-149 1-9 11h-5l3-5 6-6Zm58-2v2l-5 7-9 9-4 3-7 3-3 3-4 2-8 1 16-16 14-12 7-3Zm-69-1v2l-2 4h-4l1-4Zm43-5-11 7 8-9Zm-18-2v3l-5 1 2-4Zm-9 0-5 6-8 6-3-2 1-5 2-2 9-4Zm153-3 1-2 12 1 7 2 3 4-18-3Zm5 2v3h-29l-17 3-18 5h-4v-3l7-1v-3l14-4 6 1 13-3h9l9-2 5 1 1 2Zm-58-4-9 9h-13l-3 2h-4l-2 1h2l1-1h5l2-2h4l3 4-4 3-5 2-7 7-4 1-2-2v-2l3-3-3 1-7 6-4-1 6-7 10-3-6-1 8-7 22-8h3l1-1Zm82-3h2l10 4 5 3-2 2h-2l-7-4h-2l-4-2Zm-58 2 11-2 13 3-19 2Zm19-7h-5l-10 5-7 1-6 3-10 3-4-2 3-3 4-2 9-2 6-3 9-1 4-2Zm-31-1-8 4-3-1v-2l-5 3-6-2 6-3 12-2Zm-27-2h-2l-10 6h-2l-13 8h-7l2-3 3-2 5-1 15-9 6-2Zm-28-4-9 8-5 1v-2l10-8Zm114-5h2l4 2 6 6 4 6-2 3-10-5 5-1-10-9Zm-8 0h3l4 2 6 9h-6l-7-8Zm-66 1 6-1 20 1 4 4h-8l-6-2-11 1Zm0 0h-4l-11 3-2-2 11-4Zm27-4h11l18 3 6 3v3l-19-1-4-2h-4l-3-2-5-1Zm-26-1 1-4 8-2 8 3h-4l-2 1 8 3-9 1Zm51-5h3l10 3-2-1-1-2 3-2 11 4 6 4 4 4 9 18-3-1-4-8-7-8-9-4h-9l-5-3h-3Zm-4-2 1-2 10 1 1 4h-3Zm-60-1-7 2-3-1 2-2 5-2Zm62-2-21-1-2-3-20 1-5 1-3 2-3-3h2v-3h-3l-3 2-10 2-21 12-12 4 1-3 13-10 20-10 13-5 11-3h12l5 1 7 3v3l-21-1-6 2h-5 10l1-1h17l6 1 3 2 9 2 3 2Z"/></svg>';
function renderCarbonIconMarkup(
  {
    attrs,
    content,
    name,
  }: CarbonIconDescriptor,
  className: string,
): string {
  const paths = content.map((node: CarbonIconDescriptor["content"][number]) => {
    const attributes = Object.entries(node.attrs)
      .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
      .join(" ");

    return `<path ${attributes}></path>`;
  }).join("");

  return `<svg class="${
    escapeHtml(className)
  }" width="${attrs.width}" height="${attrs.height}" viewBox="${
    escapeHtml(attrs.viewBox)
  }" fill="currentColor" aria-hidden="true" focusable="false" data-carbon-icon="${
    escapeHtml(name)
  }">${paths}</svg>`;
}

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/about/";
/** Page title. */
export const title = "About";
/** Page meta description. */
export const description =
  "About Phiphi—a software person writing from Chengdu, China.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "À propos",
  description: "À propos de Phiphi — une personne qui écrit depuis Chengdu.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "关于",
  description: "关于 Phiphi：一位在成都写作的软件从业者。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "關於",
  description: "關於 Phiphi：一位在成都寫作的軟體工作者。",
} as const;

/** Renders the About page body. */
export default (data: Lume.Data, helpers: Lume.Helpers): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const atomXmlUrl = getLocalizedAtomFeedUrl(language);
  const feedXmlUrl = getLocalizedRssFeedUrl(language);
  const feedJsonUrl = getLocalizedJsonFeedUrl(language);
  const closeIconMarkup = renderCarbonIconMarkup(
    CARBON_CLOSE_ICON,
    "about-contact-action-icon-svg",
  );
  const downloadIconMarkup = renderCarbonIconMarkup(
    CARBON_DOWNLOAD_ICON,
    "about-contact-action-icon-svg",
  );
  const locationIconMarkup = renderCarbonIconMarkup(
    CARBON_LOCATION_ICON,
    "about-fact-icon-svg",
  );
  const notebookIconMarkup = renderCarbonIconMarkup(
    CARBON_NOTEBOOK_ICON,
    "about-fact-icon-svg",
  );
  const translateIconMarkup = renderCarbonIconMarkup(
    CARBON_TRANSLATE_ICON,
    "about-fact-icon-svg",
  );
  const qrImageSizes =
    "(min-width: 66rem) 16rem, (min-width: 42rem) 14rem, calc(100vw - 6rem)";
  const qrImageTransforms = "avif webp jpg 240 360 512";
  const icon = helpers.icon?.bind(helpers) ??
    ((key: string, catalogId: string): string =>
      `/icons/${catalogId}/${key}.svg`);
  icon("wechat", "simpleicons");
  icon("telegram", "simpleicons");
  const finalSeparator = language === "fr"
    ? "ou"
    : language === "zhHans" || language === "zhHant"
    ? "或"
    : "or";
  const listSeparator = language === "zhHans" || language === "zhHant"
    ? "、"
    : ", ";
  const localizedWechatAssetLanguage = language === "fr"
    ? "fr"
    : language === "zhHans"
    ? "zh-hans"
    : language === "zhHant"
    ? "zh-hant"
    : "en";
  const contacts = [
    {
      key: "telegram",
      iconClass: "about-contact-icon--telegram",
      label: translations.about.contactTelegramLabel,
      alt: translations.about.contactTelegramQrAlt,
      originalSrc: "/contact/telegram/contact-telegram.jpg",
      downloadName: "contact-telegram.jpg",
      width: 1170,
      height: 2532,
    },
    {
      key: "wechat",
      iconClass: "about-contact-icon--wechat",
      label: translations.about.contactWechatLabel,
      alt: translations.about.contactWechatQrAlt,
      originalSrc:
        `/contact/wechat/contact-wechat-${localizedWechatAssetLanguage}.jpg`,
      downloadName: `contact-wechat-${localizedWechatAssetLanguage}.jpg`,
      width: 1224,
      height: 1605,
    },
  ] as const;
  const facts = [
    {
      iconMarkup: locationIconMarkup,
      iconClass: "about-fact-icon--location",
      term: translations.about.locationLabel,
      value: translations.about.locationValue,
    },
    {
      iconMarkup: notebookIconMarkup,
      iconClass: "about-fact-icon--topics",
      term: translations.about.topicsLabel,
      value: translations.about.topicsValue,
    },
    {
      iconMarkup: translateIconMarkup,
      iconClass: "about-fact-icon--languages",
      term: translations.about.languagesLabel,
      value: translations.about.languagesValue,
    },
  ] as const;
  const contactItems = contacts.map((contact) => {
    const panelId = `contact-qr-${contact.key}`;
    const titleId = `${panelId}-title`;
    const triggerLabel =
      `${contact.label}: ${translations.about.contactOpenQrLabel}`;

    return `<li class="about-contact-item">
            <div
              class="cds--popover-container cds--popover--bottom cds--popover--align-left cds--popover--drop-shadow cds--popover--caret cds--toggletip about-contact-toggletip"
              data-contact-toggletip=""
            >
              <button
                type="button"
                class="about-contact-trigger cds--toggletip-button"
                aria-controls="${escapeHtml(panelId)}"
                aria-expanded="false"
                aria-haspopup="dialog"
                aria-label="${escapeHtml(triggerLabel)}"
                data-contact-toggletip-trigger=""
              >
                <span class="about-contact-trigger-content">
                  <span
                    class="about-contact-icon ${escapeHtml(contact.iconClass)}"
                    aria-hidden="true"
                  ></span>
                  <span class="about-contact-label">${
      escapeHtml(contact.label)
    }</span>
                </span>
              </button>
	              <div class="cds--popover" hidden>
                <span class="cds--popover-caret"></span>
                <div
                  id="${escapeHtml(panelId)}"
                  class="cds--popover-content cds--toggletip-content about-contact-popover"
                  role="dialog"
                  aria-modal="false"
                  aria-labelledby="${escapeHtml(titleId)}"
                  tabindex="-1"
                  data-contact-toggletip-panel=""
                >
                  <div class="about-contact-popover-header">
                    <div class="about-contact-popover-brand">
                      <span
                        class="about-contact-icon about-contact-popover-app ${
      escapeHtml(contact.iconClass)
    }"
                        aria-hidden="true"
                      ></span>
                      <span id="${escapeHtml(titleId)}" class="sr-only">${
      escapeHtml(contact.label)
    }</span>
                    </div>
                    <div class="about-contact-popover-toolbar">
                      <a
                        class="cds--btn cds--btn--ghost about-contact-action about-contact-download"
                        href="${escapeHtml(contact.originalSrc)}"
                        download="${escapeHtml(contact.downloadName)}"
                        aria-label="${
      escapeHtml(translations.about.contactDownloadJpgLabel)
    }"
                        title="${
      escapeHtml(translations.about.contactDownloadJpgLabel)
    }"
                      >
                        <span class="about-contact-action-icon" aria-hidden="true">
                          ${downloadIconMarkup}
                        </span>
                      </a>
                      <button
                        type="button"
                        class="cds--btn cds--btn--ghost about-contact-action about-contact-close"
                        aria-label="${
      escapeHtml(translations.about.contactCloseLabel)
    }"
                        title="${
      escapeHtml(translations.about.contactCloseLabel)
    }"
                        data-contact-toggletip-close=""
                      >
                        <span class="about-contact-action-icon" aria-hidden="true">
                          ${closeIconMarkup}
                        </span>
                      </button>
                    </div>
                  </div>
                  <figure class="about-contact-qr">
                    <img
                      src="${escapeHtml(contact.originalSrc)}"
                      alt="${escapeHtml(contact.alt)}"
                      width="${contact.width}"
                      height="${contact.height}"
                      loading="lazy"
                      decoding="async"
                      sizes="${escapeHtml(qrImageSizes)}"
                      transform-images="${escapeHtml(qrImageTransforms)}"
                    />
                  </figure>
                </div>
              </div>
            </div>
          </li>`;
  }).join("");
  const factItems = facts.map((fact) =>
    `<div class="about-facts-row">
      <dt class="about-facts-term">
        <span class="about-fact-icon ${
      escapeHtml(fact.iconClass)
    }" aria-hidden="true">
          ${fact.iconMarkup}
        </span>
        <span class="about-facts-term-label">${escapeHtml(fact.term)}</span>
      </dt>
      <dd class="about-facts-description">${escapeHtml(fact.value)}</dd>
    </div>`
  ).join("");

  return `<div class="site-page-shell site-page-shell--wide">
<nav class="cds--breadcrumb" aria-label="${
    escapeHtml(translations.about.breadcrumbAriaLabel)
  }">
  <ol class="cds--breadcrumb-list">
    <li class="cds--breadcrumb-item">
      <a href="${escapeHtml(homeUrl)}" class="cds--breadcrumb-link">${
    escapeHtml(translations.navigation.home)
  }</a>
    </li>
    <li class="cds--breadcrumb-item">
      <span class="cds--breadcrumb-current" aria-current="page">${
    escapeHtml(translations.about.title)
  }</span>
    </li>
  </ol>
</nav>
<section class="cds--tile pagehead about-pagehead" aria-labelledby="about-title">
  <p class="pagehead-eyebrow">${escapeHtml(translations.about.eyebrow)}</p>
  <h1 id="about-title" class="about-title">${
    escapeHtml(translations.about.title)
  }</h1>
  <p class="pagehead-lead">${escapeHtml(translations.about.lead)}</p>
</section>
<div class="feature-layout feature-layout--with-rail">
  <div class="feature-main">
    <div class="about-content">
      <p>${escapeHtml(translations.about.intro)}</p>
      <p>${escapeHtml(translations.about.body)}</p>
      <p>
        ${escapeHtml(translations.about.feedsIntro)} <a href="${
    escapeHtml(feedXmlUrl)
  }">RSS</a>${escapeHtml(listSeparator)}<a href="${
    escapeHtml(atomXmlUrl)
  }">Atom</a> ${escapeHtml(finalSeparator)}
        <a href="${escapeHtml(feedJsonUrl)}">JSON Feed</a>.
      </p>
    </div>
  </div>
  <aside class="feature-rail about-rail" aria-label="${
    escapeHtml(translations.about.railAriaLabel)
  }">
    <div class="feature-rail-sticky">
      <section class="cds--tile feature-card about-contact-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.contactTitle)
  }</h2>
        <ul class="about-contact-list">
          ${contactItems}
        </ul>
      </section>
      <section class="cds--tile feature-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.atAGlanceTitle)
  }</h2>
        <dl class="about-facts">
          ${factItems}
        </dl>
      </section>
      <section class="cds--tile feature-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.siteNotesTitle)
  }</h2>
        <ul class="about-notes">
          <li>${escapeHtml(translations.about.siteNoteOne)}</li>
          <li>${escapeHtml(translations.about.siteNoteTwo)}</li>
          <li>${escapeHtml(translations.about.siteNoteThree)}</li>
        </ul>
      </section>
      <section class="cds--tile feature-card about-pictogram-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.pictogramTitle)
  }</h2>
        <div class="about-pictogram-frame" aria-hidden="true">
          <div class="about-pictogram">
            ${LAO_YANG}
          </div>
        </div>
        <p class="feature-card-caption">${
    escapeHtml(translations.about.pictogramCaption)
  }</p>
      </section>
    </div>
  </aside>
</div>
</div>`;
};
