$(function() {
  const $book    = $('#flipbook');
  const narrador = document.getElementById('narrador');
  let audioList  = [];

  // 1) Construye lista de audios
  function buildAudioList() {
    audioList = $book
      .find('.page')
      .map((i, el) => $(el).data('audio') || '')
      .get();
    console.log('%c[audioList]', 'color:purple', audioList);
  }

  // 2) Redimensiona el flipbook según el ancho de su contenedor padre
  function resizeFlipbook() {
    // toma el ancho del padre (puede ser el body o un div contenedor)
    const parentW = $book.parent().width();
    // opcional: límite máximo de ancho
    const maxW    = 800;
    const w       = Math.min(parentW * 0.95, maxW);
    const h       = Math.round(w * 1.5); // ratio 2:3
    $book.css({ width: w + 'px', height: h + 'px' })
         .turn('size', w, h);
  }

  // 3) Inicializa Turn.js + Zoom
  function initFlipbook() {
    $book.turn({
      display:    'single',
      autoCenter: true,
      pages:      audioList.length,
      when: {
        turning() {
          narrador.pause();
          narrador.currentTime = 0;
        },
        turned(e, page, view) {
          const currentPage = (view && view[0]) ? view[0] : page;
          const src         = audioList[currentPage - 1] || '';
          console.log('%c[turned]', 'color:green', 'page→', currentPage, 'audio→', src);
          if (src) {
            narrador.src = src;
            narrador.load();
            narrador.play().catch(e => console.warn('play error:', e));
          }
        }
      }
    })
    .turn('zoom', {
      max: 2,
      when: {
        tap()        { this.toggle(); },
        swipeLeft()  { this.turn('next'); },
        swipeRight() { this.turn('previous'); }
      }
    });
  }

  // 4) Bind de botones (siempre tras initFlipbook para asegurar que audioList ya existe)
  function bindControls() {
    $('#startNarration').on('click', () => {
      const currentPage = $book.turn('page');
      const src         = audioList[currentPage - 1];
      if (!src) {
        console.warn(`No hay audio en la página ${currentPage}`);
        return;
      }
      narrador.pause();
      narrador.currentTime = 0;
      narrador.src = src;
      narrador.load();
      narrador.play().catch(e => console.warn('play error:', e));
    });
    $('#pauseNarration').on('click', () => narrador.pause());
  }

  // 5) Arranque
  buildAudioList();
  initFlipbook();
  bindControls();
  resizeFlipbook();

  // 6) Resizing dinámico
  $(window).on('resize', resizeFlipbook);
});
