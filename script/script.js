const inputFile = document.getElementById("input-file");

let itemLoteQuantidades = [];
let total = 0;

inputFile.addEventListener("change", () => {
  itemLoteQuantidades = [];
  total = 0;

  const quantidadeArquivos = inputFile.files.length;
  const table = document.getElementById("table-body");
  table.innerHTML = "";

  for (let index = 0; index < quantidadeArquivos; index++) {
    lerXml(inputFile.files[index]);
  }
  if (quantidadeArquivos == 0) {
    alert("Nenhum Arquivo selecionado");
  }
});

function lerXml(arquivo) {
  const reader = new FileReader();

  reader.onload = (res) => {
    let arquivoTXT = res.target.result;

    if (window.DOMParser) {
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(arquivoTXT, "text/xml");
    } else {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(arquivoTXT);
    }

    const itensDoXML =
      xmlDoc.childNodes[0].childNodes[0].childNodes[0].getElementsByTagName(
        "det"
      );

    for (let index = 0; index < itensDoXML.length; index++) {
      const elementProduto = itensDoXML
        .item(index)
        .childNodes[0].getElementsByTagName("cProd")
        .item(0).textContent;
      const elementUnidadeMedida = itensDoXML
        .item(index)
        .childNodes[0].getElementsByTagName("uCom")
        .item(0).textContent;
      const elementquantidade = itensDoXML
        .item(index)
        .childNodes[0].getElementsByTagName("qCom")
        .item(0).textContent;
      const indexLote =
        itensDoXML
          .item(index)
          .getElementsByTagName("infAdProd")
          .item(0)
          .textContent.toLowerCase()
          .indexOf("lote") + 4;
      const indexFinalLote = itensDoXML
        .item(index)
        .getElementsByTagName("infAdProd")
        .item(0)
        .textContent.indexOf("*");
      const lote = itensDoXML
        .item(index)
        .getElementsByTagName("infAdProd")
        .item(0)
        .textContent.substring(indexLote, indexFinalLote);

      let itemLoteQuantidade = {
        produto: elementProduto,
        lote: lote.trim(),
        quantidade: parseInt(elementquantidade),
        Un: elementUnidadeMedida,
      };
      existeItemNoArray(itemLoteQuantidade);
    }
  };
  reader.onerror = (err) => console.log(err);
  reader.readAsText(arquivo);
}

function existeItemNoArray(elemento) {
  const index = itemLoteQuantidades.findIndex((el) => {
    // console.log(el)
    return el.produto == elemento.produto && el.lote == elemento.lote;
  });
  console.log(index);
  atualizarArray(index, elemento);
}

function atualizarArray(index, elemento) {
  if (index === -1) {
    itemLoteQuantidades.push(elemento);
  } else {
    itemLoteQuantidades[index].quantidade =
      parseInt(itemLoteQuantidades[index].quantidade) +
      parseInt(elemento.quantidade);
  }
  atualizarView();
}

function atualizarView() {
  const viewProduto = document.getElementById("table-body");
  const viewTotal = document.getElementById("total");
  viewProduto.innerHTML = "";
  total = 0;

  for (let index = 0; index < itemLoteQuantidades.length; index++) {
    const element = itemLoteQuantidades[index];
    total = total + element.quantidade;
    const tr = document.createElement("tr");
    const tdId = document.createElement("td");
    tdId.innerText = index;
    const tdProduto = document.createElement("td");
    tdProduto.innerText = element.produto;
    const tdLote = document.createElement("td");
    tdLote.innerText = element.lote;
    const tdQquant = document.createElement("td");
    tdQquant.innerText = element.quantidade;
    const tdUnidade = document.createElement("td");
    tdUnidade.innerText = element.Un;

    tr.appendChild(tdId);
    tr.appendChild(tdProduto);
    tr.appendChild(tdLote);
    tr.appendChild(tdQquant);
    tr.appendChild(tdUnidade);
    viewProduto.appendChild(tr);
    viewTotal.innerText = total;
  }
  //console.log(itemLoteQuantidades)
}

const exportBtn = document.querySelector('[data-js="export-table-btn"]');

exportBtn.addEventListener("click", () => {
  if (itemLoteQuantidades.length == 0) {
    return;
  }
  const tr = document.getElementById("table-body").querySelectorAll("tr");
  const arrayTr = Array.from(tr);

  const td = arrayTr
    .map((row) => {
      return Array.from(row.cells)
        .map((cell) => cell.innerText)
        .join(";");
    })
    .join("\n");
  exportBtn.setAttribute(
    "href",
    `data:text/csvcharset=utf8,${encodeURIComponent(td)}`
  );
  exportBtn.setAttribute("download", "export.txt");
});
