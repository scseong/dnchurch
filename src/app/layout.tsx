import Script from 'next/script';
import type { Metadata } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Header, Hero, Footer, BottomNav } from '@/components/layout';
import SessionContextProvider from '@/context/SessionContextProvider';
import KakaoScript from '@/components/lib/KakaoScript';
import { SCROLL_THRESHOLD } from '@/constants';
import '@/styles/globals.scss';
import 'photoswipe/dist/photoswipe.css';

export const metadata: Metadata = {
  title: {
    template: '%s | 대구동남교회',
    default: '대구동남교회'
  },
  openGraph: {
    title: {
      template: '%s | 대구동남교회',
      default: '대구동남교회'
    },
    description: '주님의 기도를 배우는 교회(성도), 동남교회'
  }
};

const notoserifKR = Noto_Serif_KR({
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  variable: '--font-notoserifKR',
  display: 'swap'
});

const SCROLL_REVEAL_OBSERVER_SCRIPT = `
(function(){
  var STAGGER=0.1;
  var SECTION_GAP=200;
  var pending=[];
  var rafId=null;
  var revealed={};

  function isRevealed(){return !!revealed[location.pathname]}
  function markRevealed(){revealed[location.pathname]=true}

  var _push=history.pushState.bind(history);
  history.pushState=function(state,unused,url){
    markRevealed();
    return _push(state,unused,url);
  };

  function revealImmediate(el){
    el.style.transition='none';
    el.style.opacity='1';
    el.style.transform='translateY(0)';
  }

  function processBatch(){
    if(!pending.length)return;
    pending.sort(function(a,b){return a.top-b.top});
    var running=0;
    var prevTop=pending[0].top;
    for(var i=0;i<pending.length;i++){
      var item=pending[i];
      if(item.top-prevTop>SECTION_GAP){running=0}
      prevTop=item.top;
      var el=item.el;
      var base=parseFloat(el.style.transitionDelay)||0;
      var eff=Math.max(base,running);
      el.style.transitionDelay=eff+'s';
      el.style.opacity='1';
      el.style.transform='translateY(0)';
      running=eff+STAGGER;
    }
    pending=[];
  }

  var observer=new IntersectionObserver(function(entries){
    for(var i=0;i<entries.length;i++){
      if(entries[i].isIntersecting){
        pending.push({el:entries[i].target,top:entries[i].boundingClientRect.top});
        observer.unobserve(entries[i].target);
      }
    }
    if(pending.length&&!rafId){
      rafId=requestAnimationFrame(function(){processBatch();rafId=null});
    }
  },{threshold:0,rootMargin:'0px 0px 80px 0px'});

  function processElement(el){
    if(isRevealed()||el.getBoundingClientRect().bottom<0){
      revealImmediate(el);
    } else {
      observer.observe(el);
    }
  }

  function observeAll(root){
    root.querySelectorAll('[data-reveal]').forEach(processElement);
  }

  observeAll(document);

  new MutationObserver(function(mutations){
    for(var i=0;i<mutations.length;i++){
      var nodes=mutations[i].addedNodes;
      for(var j=0;j<nodes.length;j++){
        if(nodes[j].nodeType!==1)continue;
        if(nodes[j].hasAttribute('data-reveal'))processElement(nodes[j]);
        observeAll(nodes[j]);
      }
    }
  }).observe(document.getElementById('root'),{childList:true,subtree:true});
})();
`;

const API_KEY = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoserifKR.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if(window.scrollY>${SCROLL_THRESHOLD})document.documentElement.setAttribute('data-scrolled','');`
          }}
        />
      </head>
      <body>
        <Script src={API_KEY} strategy="afterInteractive" />
        <KakaoScript />
        <div id="root">
          <SessionContextProvider>
            <ScrollToTop />
            <Header />
            <Hero />
            <main id="main">{children}</main>
            <Footer />
            <BottomNav />
          </SessionContextProvider>
        </div>
        <div id="modal-root"></div>
        <Script
          id="scroll-reveal-observer"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: SCROLL_REVEAL_OBSERVER_SCRIPT }}
        />
      </body>
    </html>
  );
}
