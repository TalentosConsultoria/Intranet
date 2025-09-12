<script>
document.addEventListener('DOMContentLoaded', () => {
  // Utilitário de data seguro (sem timezone)
  const pad2 = n => String(n).padStart(2,'0');
  function toDDMMYYYY(v){
    if (v == null || v === "") return "";
    // serial Excel (número ou string numérica)
    if ((typeof v === "number" && isFinite(v)) || (/^\d+(\.\d+)?$/.test(String(v)))){
      const excelEpochUTC = Date.UTC(1899,11,30);
      const msUTC = excelEpochUTC + Math.round(Number(v) * 86400) * 1000;
      const d = new Date(msUTC);
      return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth()+1)}/${d.getUTCFullYear()}`;
    }
    const s = String(v).trim();
    let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m){ let [_, d, mo, y] = m; if (y.length===2) y=(parseInt(y,10)>50?"19":"20")+y; return `${pad2(d)}/${pad2(mo)}/${y}`; }
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return s;
  }

  // Dropdown do header (se existir)
  const dropdownButton = document.getElementById('tools-dropdown-button');
  const dropdownMenu   = document.getElementById('tools-dropdown-menu');
  if (dropdownButton && dropdownMenu){
    dropdownButton.addEventListener('click', (e)=>{ e.stopPropagation(); dropdownMenu.classList.toggle('hidden'); });
    window.addEventListener('click', ()=> dropdownMenu.classList.add('hidden'));
  }

  // ---- Elementos base
  let rawData;
  const fileInput        = document.getElementById('file-input');
  const modal            = document.getElementById('column-selection-modal');
  const closeModalButton = document.getElementById('close-modal-button');
  const columnList       = document.getElementById('column-list');

  const showMsg = (msg, ok=true) => {
    let box = document.getElementById('message-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'message-box';
      box.style.cssText = "position:fixed;bottom:24px;right:24px;padding:12px 16px;border-radius:8px;color:#fff;z-index:1000;background:"+(ok?"#16a34a":"#dc2626");
      document.body.appendChild(box);
    }
    box.textContent = msg; box.style.opacity = 1; box.style.display = 'block';
    setTimeout(()=>{ box.style.opacity = 0; setTimeout(()=> box.style.display='none', 300); }, 3000);
  };

  if (!fileInput || !modal || !closeModalButton || !columnList){
    console.warn('Elementos da ferramenta QLP não encontrados.');
    return;
  }

  // Cabeçalhos fixos (pelos índices do arquivo fonte)
  const headerMapping = [
    { newName: "CADASTRO",   originalIndex: 0 },
    { newName: "NOME",       originalIndex: 1 },
    { newName: "SITUACAO",   originalIndex: 4 },
    { newName: "FILIAL",     originalIndex: 5 },
    { newName: "VINCULO",    originalIndex: 6 },
    { newName: "ADMISSAO",   originalIndex: 7 },
    { newName: "CARGO",      originalIndex: 8 },
    { newName: "NASCIMENTO", originalIndex:10 },
    { newName: "CTPS",       originalIndex:11 },
    { newName: "SERIE",      originalIndex:13 },
    { newName: "RG",         originalIndex:14 },
    { newName: "CPF",        originalIndex:15 },
    { newName: "PIS",        originalIndex:16 }
  ];

  const vincMap = {"10":"EFETIVO/CLT","50":"TEMPORARIO","55":"JOVEM APRENDIZ"};
  const sitMap  = {"1":"Trabalhando","2":"Férias","3":"Auxílio Doença","4":"Acidente de Trabalho","5":"Serviço Militar","6":"Licença Maternidade","7":"Demitido"};
  const filMap  = {1:"TALENTOS - CLT",2:"TALENTOS - TEMPORARIO",3:"AMBEV CACHOEIRAS DE MACACU - CLT",4:"AMBEV CACHOEIRAS DE MACACU - TEMPORARIO",5:"AMBEV NOVA RIO - CLT",6:"AMBEV NOVA RIO - TEMPORARIO",7:"ARM ARMAZENS - CLT",8:"ARM ARMAZENS - TEMPORARIO",9:"BUNGE ALIMENTOS - CLT",10:"BUNGE ALIMENTOS - TEMPORARIO",11:"CARTA GOIAS - CLT",12:"CARTA GOIAS - TEMPORARIO",13:"GUANABARA T DE CASTRO - CLT",14:"GUANABARA T DE CASTRO - TEMPORARIO",15:"GUANABARA AGUA BRANCA - CLT",16:"GUANABARA AGUA BRANCA - TEMPORARIO",17:"CERVEJARIA BOHEMIA - CLT",18:"CERVEJARIA BOHEMIA - TEMPORARIO",19:"CLUB MED - CLT",20:"CLUB MED - TEMPORARIO",21:"CEPE/RIO - CLT",22:"CEPE/RIO - TEMPORARIO",23:"CORRFA - CLT",24:"CORRFA - TEMPORARIO",25:"CONSORCIO PIPE - CLT",26:"CONSORCIO PIPE - TEMPORARIO",27:"HALLIDAY GUIMARAES - CLT",28:"HALLIDAY GUIMARAES - TEMPORARIO",29:"CONTRUTORA NORBERTO ODEBRECHT - CLT",30:"CONTRUTORA NORBERTO ODEBRECHT - TEMPORARIO",31:"CRBS CDD JPA - CLT",32:"CRBS CDD JPA - TEMPORARIO",33:"CRBS CDD PAVUNA - CLT",34:"CRBS CDD PAVUNA - TEMPORARIO",35:"CRBS CDD SC - CLT",36:"CRBS CDD SC - TEMPORARIO",37:"CERVEJARIA JAGUARIUNA - CLT",38:"CERVEJARIA JAGUARIUNA - TEMPORARIO",39:"CERVEJARIA AGUAS CLARAS - CLT",40:"CERVEJARIA AGUAS CLARAS - TEMPORARIO",41:"CERVEJARIA LEYENDA - CLT",42:"CERVEJARIA LEYENDA - TEMPORARIO",43:"CERVEJARIA SAO LUIS - CLT",44:"CERVEJARIA SAO LUIS - TEMPORARIO",45:"CERVEJARIA SAO LUIS FABRICA - CLT",46:"CERVEJARIA SAO LUIS FABRICA - TEMPORARIO",47:"CONSTRUTORA QUEIROZ GALVAO - CLT",48:"CONSTRUTORA QUEIROZ GALVAO - TEMPORARIO",49:"CONSTRUTORA QUEIROZ GALVAO - GO",50:"CONSTRUTORA QUEIROZ GALVAO - GO",51:"CONSTRUTORA QUEIROZ GALVAO - SP",52:"VIGODENT INDUSTRIA - CLT",53:"VIGODENT INDUSTRIA - TEMPORARIO",54:"VIATRIS DISTRIBUIDORA - CLT",55:"VIATRIS DISTRIBUIDORA - TEMPORARIO",56:"CONSORCIO PIPE - CLT",57:"CONSORCIO PIPE - TEMPORARIO",58:"BRF - CLT",59:"VIATRIS CAMPOS",60:"VIATRIS CAMPOS - TEMPORARIO",61:"MYLAN/VIATRIS CAMPINAS - CLT",62:"MYLAN/VIATRIS CAMPINAS - TEMPORARIO",63:"PROJETO VILA LEOPOLDINA - CLT",64:"PROJETO VILA LEOPOLDINA - TEMPORARIO",65:"PROJETO VOLTA REDONDA - CLT",66:"PROJETO VOLTA REDONDA - TEMPORARIO",67:"PROJETO MINAS GERAIS - CLT",68:"PROJETO MINAS GERAIS - TEMPORARIO",69:"CRBS CDD VOLTA REDONDA - CLT",70:"CRBS CDD VOLTA REDONDA - TEMPORARIO",71:"CRBS CDD NOVA IGUAÇU - CLT",72:"CRBS CDD NOVA IGUAÇU - TEMPORARIO",73:"CRBS CDD VOLTA REDONDA - CLT",74:"CRBS CDD VOLTA REDONDA - TEMPORARIO",75:"ALYA - CLT",76:"ALYA - TEMPORARIO",77:"PROJETO JPA ARQUIVO CLT",78:"PROJETO JPA ARQUIVO TEMP",79:"EXTERRAN - CLT",80:"EXTERRAN - TEMPORARIO",81:"MYLAN DISTRIBUIDORA DE MEDICAMENTOS - CLT",82:"MYLAN DISTRIBUIDora DE MEDICAMENTOS - TEMPORARIO",83:"AMBEV JAGUARIUNA - CLT",84:"AMBEV JAGUARIUNA - TEMPORARIO",85:"BELA VISTA INCORPORADORA - CLT",86:"BELA VISTA INCORPORADORA - TEMPORARIO",87:"KONGSBERG MARITIME CM BRASIL LTDA. - CLT",88:"KONGSBERG MARITIME CM BRASIL LTDA - TEMPORARIO",89:"CNO S/A - CLT",90:"CNO S/A - TEMPORARIO",91:"BLU (ENOPP) - CLT",92:"BLU (ENOPP) - TEMPORARIO",93:"MYLAN BRASIL DISTRIBUIDORA - CLT",94:"MYLAN BRASIL DISTRIBUIDORA - TEMPORARIO",95:"BALL EMBALAGENS LTDA - CLT",96:"BALL EMBALAGENS LTDA - TEMPORARIOS",97:"LATICINIOS BELA VISTA - CLT",98:"LATICINIOS BELA VISTA - TEMPORARIO",99:"TALENTOS RJ - CLT",100:"TALENTOS RJ - TEMPORARIO",101:"TALENTOS SP - CLT",102:"AMBEV PIRAI - CLT",103:"AMBEV PIRAI - TEMPORARIO",104:"AMBEV VIDROS - CLT",105:"AMBEV VIDROS - TEMPORARIO",106:"KONGSBERG MARITIME - CLT",107:"KONGSBERG MARITIME - TEMPORARIO",108:"SVITZER - CLT",109:"SVITZER - TEMPORARIO",110:"VIATRIS BRASIL - CLT",111:"VIATRIS BRASIL - TEMPORARIO",112:"GREIF - CLT",113:"VIATRIS SP - CLT",114:"ABS - CLT",115:"ABS - TEMPORARIO",116:"RUHRPUMPEN - CLT",117:"RUHRPUMPEN - TEMPORARIO",118:"AMBEV NOVA RIO EMP - CLT",119:"AMBEV NOVA RIO EMP - TEMPORARIO"};

  // Fallback: corrige XLSX com entradas do ZIP usando "\" ao invés de "/"
  async function readWorkbookFixingZip(ab){
    try {
      return XLSX.read(ab, { type:'array', raw:true, WTF:true });
    } catch (err) {
      // tenta corrigir com JSZip
      try {
        const zip = await JSZip.loadAsync(ab);
        const fixed = new JSZip();
        const names = Object.keys(zip.files);
        await Promise.all(names.map(async (name)=>{
          const file = zip.files[name];
          const newName = name.replace(/\\/g,'/');  // <-- normaliza
          if (file.dir) fixed.folder(newName);
          else {
            const content = await file.async('arraybuffer');
            fixed.file(newName, content);
          }
        }));
        const fixedAb = await fixed.generateAsync({ type:'arraybuffer' });
        return XLSX.read(fixedAb, { type:'array', raw:true, WTF:true });
      } catch(e2){
        console.error('Falhou fallback JSZip:', e2);
        throw err;
      }
    }
  }

  fileInput.addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const buf = await f.arrayBuffer();
      const wb  = await readWorkbookFixingZip(buf);
      const sheetName = wb.SheetNames[0];
      const ws   = wb.Sheets[sheetName];
      // raw:true + defval:"" evita undefined e conversões indesejadas
      rawData = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });
      displayColumnSelectionModal();
    } catch (err) {
      console.error(err);
      alert("Não consegui abrir o arquivo. Tente salvar no Excel como .xlsx e importar novamente.");
    }
  });

  closeModalButton.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', (e)=>{ if (e.target === modal) modal.classList.add('hidden'); });

  function displayColumnSelectionModal(){
    columnList.innerHTML = '';
    headerMapping.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `
        <label class="flex items-center text-gray-700 cursor-pointer">
          <input type="checkbox" checked value="${m.originalIndex}"
                 class="mr-3 h-5 w-5 rounded text-primary focus:ring-primary border-gray-300">
          ${m.newName}
        </label>`;
      columnList.appendChild(li);
    });
    modal.classList.remove('hidden');
  }

  function processAndDownloadData(data, columnsToKeep, newHeaders, unitName){
    if (!data || data.length <= 4) { alert("Arquivo inválido (precisa de 5+ linhas)."); return; }

    let rows = data.slice(4); // pula 4 primeiras
    // mantém 46, pula 5, repete
    let out = [], kept = 0, skipped = 0;
    for (let i=0;i<rows.length;i++){
      if (kept < 46){ out.push(rows[i]); kept++; }
      else if (skipped < 5){ skipped++; }
      if (skipped === 5){ kept=0; skipped=0; }
    }

    const cut = out.findIndex(r => r[0] && String(r[0]).toLowerCase().includes('total'));
    if (cut !== -1) out = out.slice(0, cut);

    const findIdx = (name) => (headerMapping.find(m => m.newName===name)?.originalIndex ?? -1);
    const iVinc=findIdx("VINCULO"), iSit=findIdx("SITUACAO"), iFil=findIdx("FILIAL"),
          iCPF=findIdx("CPF"), iPIS=findIdx("PIS"), iAdm=findIdx("ADMISSAO"), iNas=findIdx("NASCIMENTO");

    const formatted = out.map(r => {
      const nr = [];
      columnsToKeep.forEach(c => {
        let v = r[c] ?? '';

        if (c===iVinc) v = vincMap[String(v)] || v;
        if (c===iSit)  v = sitMap[String(parseInt(v,10))] || v;
        if (c===iFil)  v = filMap[v] || v;

        if (c===iCPF){
          let cpf = String(v).replace(/\D/g,'').padStart(11,'0');
          if (cpf.length===11) v = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
        }
        if (c===iPIS){
          let pis = String(v).replace(/\D/g,'').padStart(11,'0');
          if (pis.length===11) v = pis.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/,'$1.$2.$3-$4');
        }

        if (c===iAdm || c===iNas) v = toDDMMYYYY(v);

        nr.push(v);
      });
      return nr;
    });

    formatted.unshift(newHeaders);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Planilha Formatada");
    const fileName = `QLP - ${ (document.getElementById('unit-name-input')?.value.trim() || 'PlanilhaFormatada') }.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  // Exposto global (o botão chama inline)
  window.downloadSelectedColumns = function(){
    const boxes = document.querySelectorAll('#column-list input[type="checkbox"]:checked');
    const keep  = Array.from(boxes).map(cb => parseInt(cb.value,10));
    const headers = Array.from(boxes).map(cb => {
      const idx = parseInt(cb.value,10);
      const m = headerMapping.find(x => x.originalIndex===idx);
      return m ? m.newName : "COLUNA DESCONHECIDA";
    });
    processAndDownloadData(rawData, keep, headers);
    modal.classList.add('hidden');
  };
});
</script>
