<?php include 'Layouts/_header.php'; ?>
  
  <div class="container">
    
    <main id="main-content" class="main-content" tabindex="-1">
      <!-- ================== Artigo ================== -->
      <section class="wiki-article" id="article-root">
        <h1 class="article-title">Título do Artigo</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
        </p>
        
        <section class="document-reader" aria-label="Leitura do documento em PDF">
          <h2>Documento em PDF</h2>
          <p>Leia o documento diretamente abaixo ou faça o download para visualizar no seu dispositivo.</p>
          <div class="pdf-actions">
            <a class="btn btn-primary" href="TESTE.pdf" download>Baixar PDF</a>
          </div>
          <div class="pdf-viewport">
            <object
              data="TESTE.pdf"
              type="application/pdf"
              width="100%"
              height="800"
              aria-label="Visualizador de PDF">
              <p>
                Não foi possível carregar o PDF no navegador.
                <a href="TESTE.pdf" download>Baixe o PDF</a> para visualizar localmente.
              </p>
            </object>
          </div>
        </section>
      </section>
    </main>
  </div>
<?php include 'Layouts/_footer.php'; ?>
  

