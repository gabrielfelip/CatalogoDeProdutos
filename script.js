const form = document.getElementById("product-form");
const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-catalog-btn");
const feedback = document.getElementById("feedback");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let produtosFiltrados = [];
let currentPage = 1;
const produtosPorPagina = 5;

// Mostrar feedback
function mostrarFeedback(mensagem, tipo = "success") {
  feedback.textContent = mensagem;
  feedback.className = "";
  feedback.classList.add(tipo === "error" ? "error" : "success");
  feedback.classList.remove("hidden");

  setTimeout(() => {
    feedback.classList.add("hidden");
  }, 3000);
}

// Salvar no localStorage
function salvarNoLocalStorage() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

// Renderizar a lista com paginação
function renderizarLista(lista = produtosFiltrados.length ? produtosFiltrados : produtos) {
  productList.innerHTML = "";

  const start = (currentPage - 1) * produtosPorPagina;
  const end = start + produtosPorPagina;
  const paginaAtual = lista.slice(start, end);

  if (paginaAtual.length === 0 && currentPage > 1) {
    currentPage--;
    renderizarLista(lista);
    return;
  }

  paginaAtual.forEach((produto, index) => {
    const li = document.createElement("li");
    li.className = "product-item";

    li.innerHTML = `
  <h3>${produto.nome}</h3>
  <p class="preco">Preço: R$ ${produto.preco.toFixed(2)}</p>
  ${produto.lote ? `<p class="descricao">Lote: ${produto.lote}</p>` : ""}
  ${produto.descricao ? `<p class="descricao">${produto.descricao}</p>` : ""}
  <button class="edit-btn editar" data-index="${produtos.indexOf(produto)}">Editar</button>
  <button class="remove-btn" data-index="${produtos.indexOf(produto)}">Excluir</button>
`;

    productList.appendChild(li);
  });

  criarPaginacao(lista);
}

// Criar paginação
function criarPaginacao(lista) {
  const totalPaginas = Math.ceil(lista.length / produtosPorPagina);
  const paginacao = document.createElement("div");
  paginacao.className = "paginacao";

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "pagina-ativa" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderizarLista(lista);
    });
    paginacao.appendChild(btn);
  }

  productList.appendChild(paginacao);
}

// Adicionar ou atualizar produto
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("name").value.trim();
  const preco = parseFloat(document.getElementById("price").value);
  const lote = document.getElementById("lote").value.trim();
  const descricao = document.getElementById("description").value.trim();

  if (!nome || isNaN(preco)) {
    mostrarFeedback("Nome e preço são obrigatórios.", "error");
    return;
  }

  if (form.dataset.editIndex) {
    // Editando
    const index = parseInt(form.dataset.editIndex);
    produtos[index] = { nome, preco, lote, descricao };
    delete form.dataset.editIndex;
    mostrarFeedback("Produto editado com sucesso!");
  } else {
    // Novo
    produtos.push({ nome, preco, lote, descricao });
    mostrarFeedback("Produto adicionado com sucesso!");
  }

  salvarNoLocalStorage();
  currentPage = 1;
  form.reset();
  renderizarLista();
});

// Remover ou Editar produto
productList.addEventListener("click", (e) => {
  const index = parseInt(e.target.getAttribute("data-index"));

  if (e.target.classList.contains("remove-btn")) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      produtos.splice(index, 1);
      salvarNoLocalStorage();
      mostrarFeedback("Produto removido!");
      renderizarLista();
    }
  } else if (e.target.classList.contains("edit-btn")) {
    const produto = produtos[index];
    document.getElementById("name").value = produto.nome;
    document.getElementById("price").value = produto.preco;
    document.getElementById("lote").value = produto.lote;
    document.getElementById("description").value = produto.descricao;
    form.dataset.editIndex = index;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// Buscar produto
searchInput.addEventListener("input", () => {
  const termo = searchInput.value.toLowerCase();
  produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().startsWith(termo)
  );
  currentPage = 1;
  renderizarLista(produtosFiltrados);
});

// Limpar catálogo
clearBtn.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja limpar todos os produtos?")) {
    produtos = [];
    produtosFiltrados = [];
    currentPage = 1;
    salvarNoLocalStorage();
    renderizarLista();
    mostrarFeedback("Catálogo limpo.");
  }
});

window.onload = () => {
  document.getElementById("name").focus();
};

document.getElementById("sort-options").addEventListener("change", (e) => {
  const valor = e.target.value;
  const lista = produtosFiltrados.length ? produtosFiltrados : produtos;

  if (valor === "az") lista.sort((a, b) => a.nome.localeCompare(b.nome));
  if (valor === "za") lista.sort((a, b) => b.nome.localeCompare(a.nome));
  if (valor === "precoAsc") lista.sort((a, b) => a.preco - b.preco);
  if (valor === "precoDesc") lista.sort((a, b) => b.preco - a.preco);

  renderizarLista(lista);
});



