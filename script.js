let saldo = 0;
let historico = [];
let saldoHistorico = [];
let graficoTransacoes;
let graficoSaldo;
function adicionarTransacao() {
  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (!descricao) {
    mostrarToast("A descrição não pode estar vazia.", "error");
    return;
  }

  if (isNaN(valor) || valor <= 0) {
    mostrarToast("Insira um valor válido maior que zero.", "warning");
    return;
  }

  const categoria = tipo === "entrada" ? "Receita" : "Despesa";
  const dataAtual = new Date().toISOString().split("T")[0];

  saldo += tipo === "entrada" ? valor : -valor;

  historico.push({
    tipo: tipo === "entrada" ? "Entrada" : "Saída",
    valor,
    categoria,
    descricao,
    data: dataAtual,
  });

  saldoHistorico.push({ data: dataAtual, saldo });

  atualizarInterface();
  mostrarToast("Transação adicionada com sucesso!", "success");

  // Limpar os campos após adicionar a transação
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
}

function mostrarToast(mensagem, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  // Adiciona o ícone conforme o tipo
  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.textContent = tipo === "success" ? "✔️" : tipo === "error" ? "❌" : "⚠️";

  toast.appendChild(icon);

  // Adiciona o texto da mensagem
  const text = document.createElement("span");
  text.textContent = mensagem;
  toast.appendChild(text);

  // Adiciona o toast ao body
  document.body.appendChild(toast);

  // Remove o toast após 4 segundos
  setTimeout(() => {
    toast.remove();
  }, 4000);
}



function filtrarTransacoes() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;
  const tipoFiltro = document.getElementById("tipoFiltro").value;

  if (!dataInicio || !dataFim) {
    alert("Por favor, selecione ambas as datas.");
    return;
  }

  let historicoFiltrado = historico.filter(item => item.data >= dataInicio && item.data <= dataFim);

  // Filtrar também pelo tipo de transação
  if (tipoFiltro !== "todos") {
    historicoFiltrado = historicoFiltrado.filter(item => item.tipo === tipoFiltro);
  }

if (historicoFiltrado.length === 0) {
  mostrarToast("Nenhuma transação encontrada nesse período.", "warning");
  return;
}
  atualizarHistorico(historicoFiltrado);
}

function atualizarHistorico(lista = historico) {
  const historicoElement = document.getElementById("historico");
  historicoElement.innerHTML = "";

  if (lista.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma transação registrada.";
    historicoElement.appendChild(li);
  }

  lista.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.tipo}: ${item.valor} Kz - ${item.categoria} (${item.descricao}) - ${item.data}`;
    historicoElement.appendChild(li);
  });
}

function atualizarInterface() {
  document.getElementById("resultado").textContent = `Saldo Atual: ${saldo} Kz`;
  atualizarHistorico();
  atualizarGraficoTransacoes();
  atualizarGraficoSaldo();
  salvarDados();
}

function atualizarGraficoTransacoes() {
  const ctx = document.getElementById("graficoTransacoes").getContext("2d");
  if (graficoTransacoes) graficoTransacoes.destroy();

  const entradas = historico.filter(item => item.tipo === "Entrada").reduce((acc, item) => acc + item.valor, 0);
  const saidas = historico.filter(item => item.tipo === "Saída").reduce((acc, item) => acc + item.valor, 0);

  graficoTransacoes = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [{
        data: [entradas, saidas],
        backgroundColor: ["#4CAF50", "#F44336"],
      }],
    },
    options: { responsive: true },
  });
}


function atualizarGraficoSaldo() {
  const ctx = document.getElementById("graficoSaldo").getContext("2d");
  if (graficoSaldo) graficoSaldo.destroy();

  const datas = saldoHistorico.map(item => item.data);
  const saldos = saldoHistorico.map(item => item.saldo);

  graficoSaldo = new Chart(ctx, {
    type: "line",
    data: {
      labels: datas,
      datasets: [{
        label: "Evolução do Saldo",
        data: saldos,
        borderColor: "#2196F3",
        fill: false,
      }],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Data" } },
        y: { title: { display: true, text: "Saldo (Kz)" } },
      },
    },
  });
}

function salvarDados() {
  localStorage.setItem("saldo", saldo);
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("saldoHistorico", JSON.stringify(saldoHistorico));
}

function carregarDados() {
  const saldoStorage = localStorage.getItem("saldo");
  const historicoStorage = localStorage.getItem("historico");
  const saldoHistoricoStorage = localStorage.getItem("saldoHistorico");

  saldo = saldoStorage ? parseFloat(saldoStorage) : 0;
  historico = historicoStorage ? JSON.parse(historicoStorage) : [];
  saldoHistorico = saldoHistoricoStorage ? JSON.parse(saldoHistoricoStorage) : [];
  atualizarInterface();
}

function limparDados() {
  if (confirm("Tem certeza de que deseja limpar todos os dados?")) {
    localStorage.clear();
    saldo = 0;
    historico = [];
    saldoHistorico = [];
    atualizarInterface();
  }
  if (confirm("Tem certeza de que deseja limpar todos os dados?")) {
  localStorage.clear();
  saldo = 0;
  historico = [];
  saldoHistorico = [];
  atualizarInterface();
  mostrarToast("Todos os dados foram apagados com sucesso.", "success");
}
}

function exportarCSV() {
  let csv = "Tipo,Valor,Categoria,Descrição,Data\n";
  historico.forEach(item => {
    csv += `${item.tipo},${item.valor},${item.categoria},${item.descricao},${item.data}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historico_transacoes.csv";
  a.click();
}
function limparDados() {
  if (confirm("Tem certeza de que deseja limpar todos os dados?")) {
    localStorage.clear();
    saldo = 0;
    historico = [];
    saldoHistorico = [];
    atualizarInterface();
  }
}

window.onload = carregarDados;