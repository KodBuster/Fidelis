import Script from "next/script";
import {
  METRIKA_ID,
  METRIKA_IDS,
  METRIKA_READY_EVENT,
} from "@/lib/analytics/metrika";

const INIT_OPTIONS = `{
  clickmap:true,
  trackLinks:true,
  accurateTrackBounce:true,
  webvisor:true,
  ecommerce:'dataLayer'
}`;

const initCalls = METRIKA_IDS.map(
  (id) => `ym(${id}, 'init', ${INIT_OPTIONS});`
).join("\n");

/** Скрипт Метрики. Пока METRIKA_IDS пуст — ничего не грузим. */
export function YandexMetrika() {
  if (METRIKA_IDS.length === 0 || !METRIKA_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="data-layer"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: "window.dataLayer = window.dataLayer || [];",
        }}
      />
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');

${initCalls}

window.dispatchEvent(new Event('${METRIKA_READY_EVENT}'));
          `.trim(),
        }}
      />
      <noscript>
        <div>
          {METRIKA_IDS.map((id) => (
            <img
              key={id}
              src={`https://mc.yandex.ru/watch/${id}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          ))}
        </div>
      </noscript>
    </>
  );
}
