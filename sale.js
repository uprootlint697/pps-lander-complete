(()=>{const CAMPAIGN_NAME=typeof window<"u"&&window.CAMPAIGN_NAME||"\u{1F341} Fall Sale",SEARCH_PATTERNS=[/Summer Sale/gi],SKIP_TAGS=new Set(["SCRIPT","STYLE","NOSCRIPT","IFRAME","CODE","PRE"]);function replaceInTextNode(node){let txt=node.nodeValue,changed=!1;for(const re of SEARCH_PATTERNS)re.test(txt)&&(txt=txt.replace(re,CAMPAIGN_NAME),changed=!0);return changed&&(node.nodeValue=txt),changed}function replaceEverywhere(root=document.body){if(!root)return 0;let count=0;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const parent=node.parentNode;return!parent||SKIP_TAGS.has(parent.nodeName)||!node.nodeValue||!node.nodeValue.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});let current;for(;current=walker.nextNode();)replaceInTextNode(current)&&count++;return count}function replaceInTitle(){if(!document.title)return 0;let changed=0,t=document.title;for(const re of SEARCH_PATTERNS)re.test(t)&&(t=t.replace(re,CAMPAIGN_NAME),changed++);return changed&&(document.title=t),changed}function observeMutations(){new MutationObserver(mutations=>{let changed=0;for(const m of mutations)for(const n of m.addedNodes||[])n.nodeType===1&&!SKIP_TAGS.has(n.nodeName)?changed+=replaceEverywhere(n):n.nodeType===3&&(changed+=replaceInTextNode(n)?1:0);changed&&window.SALE_DEBUG&&console.log(`[sale.js] Replaced in dynamic nodes: ${changed}`)}).observe(document.documentElement,{childList:!0,subtree:!0})}function run(){const total=replaceEverywhere()+replaceInTitle();window.SALE_DEBUG&&console.log(`[sale.js] Initial replacements: ${total}`),observeMutations()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",run):run()})();

(function() {
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return params.toString() ? '?' + params.toString() : '';
  }

  const urlParams = getUrlParams();

  function updateLinks() {
    const currentDomain = window.location.hostname;

    document.querySelectorAll('a[href]').forEach(anchor => {
      let href = anchor.getAttribute('href');
      if (!href) return;

      // Skip anchors and javascript links
      if (href.startsWith('#') || href.startsWith('javascript:')) return;

      // Split base and hash fragment
      let [baseUrl, hash] = href.split('#');

      // Append existing query params + passthrough URL params
      if (urlParams) {
        if (baseUrl.includes('?')) {
          baseUrl += '&' + urlParams.substring(1);
        } else {
          baseUrl += urlParams;
        }
      }

      // Add click_from param if not present already
      if (!href.includes('click_from=')) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        baseUrl += separator + 'click_from=funnelish';
      }

      // Reattach hash fragment if it exists
      if (hash) {
        baseUrl += '#' + hash;
      }

      anchor.setAttribute('href', baseUrl);
    });
  }

  document.addEventListener("DOMContentLoaded", updateLinks);
})();

/* 30-day money-back guarantee.
   Funnelish pages can't be edited, so this rides along with sale.js.
   Subscription copy ("every 60 days", "60 loads") is left alone. */
(function () {
  var SEAL_URL = "https://cdn.shopify.com/s/files/1/0551/2957/1484/files/60-days-guarantee.png?v=1792683520";
  var SEAL_CLASSES = ["guarantee_seal", "money-back-seal", "moneyback_seal", "money_back_seal", "package_seal"];
  var SEAL_FILES = ["19642422-2600-40cf-a5d0-e1e026ced147"];
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, IFRAME: 1, CODE: 1, PRE: 1, TEXTAREA: 1 };
  var busy = false;

  function replaceGuaranteeCopy(txt) {
    var next = txt;
    next = next.replace(/!?\s*That[’']s twice the guarantee you[’']d get with Dyson or Furzapper\.?/gi, "");
    next = next.replace(/\b60(?=[-\s]days?\b(?:[-\s]+money[-\s]?back)?[-\s]+guarantee\b)/gi, "30");
    // "60-Day Money<br>Back Guarantee" is split across text nodes.
    next = next.replace(/\b60(?=[-\s]days?\s+money\b)/gi, "30");
    next = next.replace(/\b(within|for|give you)(\s+)60(\s+days?\b)/gi, function (_m, lead, sp1, sp2) {
      return lead + sp1 + "30" + sp2;
    });
    next = next.replace(/\b60(\s+days?\s+to\b)/gi, "30$1");
    next = next.replace(/\b60(\s+days?\s*[—–-])/gi, "30$1");
    next = next.replace(/\ba full 2 months\b/gi, "30 days");
    next = next.replace(/\ba full two months\b/gi, "30 days");
    next = next.replace(/\btwo full months\b/gi, "30 days");
    next = next.replace(/\btwo months to change your mind\b/gi, "30 days to change your mind");
    next = next.replace(/\btwo months of trying\b/gi, "30 days of trying");
    return next;
  }

  function replaceInTextNode(node) {
    var parent = node.parentNode;
    if (!parent || SKIP_TAGS[parent.nodeName]) return;
    var value = node.nodeValue;
    if (!value || !/60|month|twice the guarantee/i.test(value)) return;
    var next = replaceGuaranteeCopy(value);
    if (next !== value) node.nodeValue = next;
  }

  function replaceText(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      replaceInTextNode(root);
      return;
    }
    if (root.nodeType !== 1 || SKIP_TAGS[root.nodeName]) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentNode;
        if (!parent || SKIP_TAGS[parent.nodeName]) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var current;
    while ((current = walker.nextNode())) replaceInTextNode(current);
    if (root === document.body || root === document.documentElement) {
      if (document.title) document.title = replaceGuaranteeCopy(document.title);
    }
  }

  function isCurrentSeal(url) {
    return !!url && url.indexOf("60-days-guarantee.png") !== -1;
  }

  function isSixtySeal(img) {
    var src = img.getAttribute("src") || "";
    var dataSrc = img.getAttribute("data-src");
    var srcset = img.getAttribute("data-srcset");
    var already = isCurrentSeal(src)
      && (!img.hasAttribute("data-src") || isCurrentSeal(dataSrc))
      && (!img.hasAttribute("data-srcset") || isCurrentSeal(srcset));
    if (already) return false;
    for (var i = 0; i < SEAL_CLASSES.length; i++) {
      if (img.classList && img.classList.contains(SEAL_CLASSES[i])) return true;
    }
    var oldUrls = [src, dataSrc, srcset, img.getAttribute("srcset")].filter(function (url) {
      return url && !isCurrentSeal(url);
    }).join(" ");
    for (var f = 0; f < SEAL_FILES.length; f++) {
      if (oldUrls.indexOf(SEAL_FILES[f]) !== -1) return true;
    }
    return /60[-_ ]?days?[-_ ]?(guarantee|money)|money[-_ ]?back[-_ ]?60/i.test(oldUrls);
  }

  function swapSeal(img) {
    if (!img || img.tagName !== "IMG" || !isSixtySeal(img)) return;
    img.setAttribute("src", SEAL_URL);
    if (img.hasAttribute("data-src")) img.setAttribute("data-src", SEAL_URL);
    if (img.hasAttribute("data-srcset")) img.setAttribute("data-srcset", SEAL_URL);
    if (img.hasAttribute("srcset")) img.removeAttribute("srcset");
    ["alt", "title", "aria-label"].forEach(function (attr) {
      var value = img.getAttribute(attr);
      if (!value) return;
      var next = replaceGuaranteeCopy(value);
      if (next !== value) img.setAttribute(attr, next);
    });
  }

  function replaceImages(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.tagName === "IMG") swapSeal(root);
    var images = root.querySelectorAll ? root.querySelectorAll("img") : [];
    for (var i = 0; i < images.length; i++) swapSeal(images[i]);
  }

  function scan(root) {
    if (busy || !root) return;
    busy = true;
    try {
      replaceText(root);
      replaceImages(root);
    } finally {
      busy = false;
    }
  }

  function watch() {
    new MutationObserver(function (mutations) {
      if (busy) return;
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === "attributes" && mutation.target && mutation.target.tagName === "IMG") {
          swapSeal(mutation.target);
          continue;
        }
        var nodes = mutation.addedNodes || [];
        for (var n = 0; n < nodes.length; n++) scan(nodes[n]);
      }
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "data-src", "data-srcset"]
    });
  }

  function run() {
    scan(document.body);
    watch();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();

