import { useEffect, useState } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise: () => Promise<void>;
      startup: { ready: () => void };
      tex: any;
      svg: any;
    };
  }
}


export const useMathJax = (enabled: boolean) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    if (enabled && !window.MathJax) {
      // Define default config before loading script
      window.MathJax = {
                tex: {
                  inlineMath: [['$', '$']],
                  displayMath: [['$$', '$$']],
                  processEscapes: true,
                  tags: 'ams',
                  tagSide: 'right',
                  tagIndent: '0.2em'
                },
                // Output rendering configuration
                output: {
                  font: 'mathjax-newcm'
                },
                // Initialization and startup configuration
                startup: {
                  pageReady() {
                    return MathJax.startup.defaultPageReady();
                  }
                }
      } as any;

      script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js";
      script.async = true;

      script.onload = () => {
        setScriptLoaded(true);
      };

      document.head.appendChild(script);
    }

    if (!enabled) {
      // Remove MathJax script
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js"]'
      );
      existingScript?.remove();

      // Remove MathJax from window
      delete window.MathJax;
      setScriptLoaded(false);
    }

    return () => {
      if (script) {
        script.remove();
      }
    };
  }, [enabled]);

  const typeset = async () => {
    if (window.MathJax) {
      try {
        await window.MathJax.typesetPromise();
      } catch (err) {
        console.error("MathJax typeset error:", err);
      }
    }
  };

  return { scriptLoaded, typeset };
};
