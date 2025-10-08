const API_URL = "";

let editandoVeiculo = null;
let editandoCliente = null;
let editandoLocacao = null;

// Navegação
function mostrarSecao(nome) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(nome).classList.add("active");
  event.target.classList.add("active");

  if (nome === "veiculos") listarVeiculos();
  if (nome === "clientes") listarClientes();
  if (nome === "locacoes") {
    listarLocacoes();
    atualizarSelectClientes();
    atualizarSelectVeiculos();
  }
  if (nome === "area-cliente") atualizarSelectClientesArea();
}

function mostrarAlerta(msg) {
  const alert = document.getElementById("alert");
  alert.textContent = msg;
  alert.style.display = "block";
  setTimeout(() => (alert.style.display = "none"), 3000);
}

// ========== VEÍCULOS ==========

async function salvarVeiculo(e) {
  e.preventDefault();

  const veiculo = {
    marca: document.getElementById("v-marca").value,
    modelo: document.getElementById("v-modelo").value,
    ano: document.getElementById("v-ano").value,
    placa: document.getElementById("v-placa").value,
    preco: parseFloat(document.getElementById("v-preco").value),
    disponivel: document.getElementById("v-disponivel").value,
  };

  try {
    const url = editandoVeiculo
      ? `${API_URL}/api/veiculos/${editandoVeiculo.id}`
      : `${API_URL}/api/veiculos`;

    const method = editandoVeiculo ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(veiculo),
    });

    if (response.ok) {
      limparFormVeiculo();
      listarVeiculos();
      mostrarAlerta("Veículo salvo com sucesso!");
    } else {
      mostrarAlerta("Erro ao salvar veículo");
    }
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao salvar veículo");
  }
}

async function listarVeiculos() {
  try {
    const response = await fetch(`${API_URL}/api/veiculos`);
    const veiculos = await response.json();

    let html =
      "<table><tr><th>Marca</th><th>Modelo</th><th>Ano</th><th>Placa</th><th>Preço/Dia</th><th>Status</th><th>Ações</th></tr>";

    veiculos.forEach((v) => {
      const status = v.disponivel
        ? '<span class="badge badge-success">Disponível</span>'
        : '<span class="badge badge-danger">Indisponível</span>';

      html += `<tr>
        <td>${v.marca}</td>
        <td>${v.modelo}</td>
        <td>${v.ano}</td>
        <td>${v.placa}</td>
        <td>R$ ${parseFloat(v.preco_diaria).toFixed(2)}</td>
        <td>${status}</td>
        <td>
          <button class="btn btn-warning" onclick='editarVeiculo(${JSON.stringify(
            v
          )})'>Editar</button>
          <button class="btn btn-danger" onclick="excluirVeiculo(${
            v.id
          })">Excluir</button>
        </td>
      </tr>`;
    });

    html += "</table>";
    document.getElementById("lista-veiculos").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao carregar veículos");
  }
}

function editarVeiculo(v) {
  editandoVeiculo = v;
  document.getElementById("v-marca").value = v.marca;
  document.getElementById("v-modelo").value = v.modelo;
  document.getElementById("v-ano").value = v.ano;
  document.getElementById("v-placa").value = v.placa;
  document.getElementById("v-preco").value = v.preco_diaria;
  document.getElementById("v-disponivel").value = v.disponivel ? "sim" : "nao";
}

async function excluirVeiculo(id) {
  if (!confirm("Deseja realmente excluir este veículo?")) return;

  try {
    const response = await fetch(`${API_URL}/api/veiculos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      listarVeiculos();
      mostrarAlerta("Veículo excluído com sucesso!");
    } else {
      mostrarAlerta("Erro ao excluir veículo");
    }
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao excluir veículo");
  }
}

function limparFormVeiculo() {
  document.getElementById("form-veiculo").reset();
  editandoVeiculo = null;
}

async function buscarVeiculos() {
  const marca = document.getElementById("busca-marca").value;
  const modelo = document.getElementById("busca-modelo").value;
  const disponivel = document.getElementById("busca-disponivel").value;

  const params = new URLSearchParams();
  if (marca) params.append("marca", marca);
  if (modelo) params.append("modelo", modelo);
  if (disponivel) params.append("disponivel", disponivel);

  try {
    const response = await fetch(`${API_URL}/api/veiculos/buscar?${params}`);
    const veiculos = await response.json();

    let html =
      "<table><tr><th>Marca</th><th>Modelo</th><th>Ano</th><th>Placa</th><th>Preço/Dia</th><th>Status</th><th>Ações</th></tr>";

    veiculos.forEach((v) => {
      const status = v.disponivel
        ? '<span class="badge badge-success">Disponível</span>'
        : '<span class="badge badge-danger">Indisponível</span>';

      html += `<tr>
        <td>${v.marca}</td>
        <td>${v.modelo}</td>
        <td>${v.ano}</td>
        <td>${v.placa}</td>
        <td>R$ ${parseFloat(v.preco_diaria).toFixed(2)}</td>
        <td>${status}</td>
        <td>
          <button class="btn btn-warning" onclick='editarVeiculo(${JSON.stringify(
            v
          )})'>Editar</button>
          <button class="btn btn-danger" onclick="excluirVeiculo(${
            v.id
          })">Excluir</button>
        </td>
      </tr>`;
    });

    html += "</table>";
    document.getElementById("lista-veiculos").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao buscar veículos");
  }
}

function limparBusca() {
  document.getElementById("busca-marca").value = "";
  document.getElementById("busca-modelo").value = "";
  document.getElementById("busca-disponivel").value = "";
  listarVeiculos();
}

// ========== CLIENTES ==========

async function salvarCliente(e) {
  e.preventDefault();

  const cliente = {
    nome: document.getElementById("c-nome").value,
    cpf: document.getElementById("c-cpf").value,
    email: document.getElementById("c-email").value,
    telefone: document.getElementById("c-telefone").value,
    endereco: document.getElementById("c-endereco").value,
  };

  try {
    const url = editandoCliente
      ? `${API_URL}/api/clientes/${editandoCliente.id}`
      : `${API_URL}/api/clientes`;

    const method = editandoCliente ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    if (response.ok) {
      limparFormCliente();
      listarClientes();
      mostrarAlerta("Cliente salvo com sucesso!");
    } else {
      mostrarAlerta("Erro ao salvar cliente");
    }
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao salvar cliente");
  }
}

async function listarClientes() {
  try {
    const response = await fetch(`${API_URL}/api/clientes`);
    const clientes = await response.json();

    let html =
      "<table><tr><th>Nome</th><th>CPF</th><th>Email</th><th>Telefone</th><th>Ações</th></tr>";

    clientes.forEach((c) => {
      html += `<tr>
        <td>${c.nome}</td>
        <td>${c.cpf}</td>
        <td>${c.email}</td>
        <td>${c.telefone || "-"}</td>
        <td>
          <button class="btn btn-warning" onclick='editarCliente(${JSON.stringify(
            c
          )})'>Editar</button>
          <button class="btn btn-danger" onclick="excluirCliente(${
            c.id
          })">Excluir</button>
          <button class="btn btn-primary" onclick="verHistoricoCliente(${
            c.id
          })">Histórico</button>
        </td>
      </tr>`;
    });

    html += "</table>";
    document.getElementById("lista-clientes").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao carregar clientes");
  }
}

function editarCliente(c) {
  editandoCliente = c;
  document.getElementById("c-nome").value = c.nome;
  document.getElementById("c-cpf").value = c.cpf;
  document.getElementById("c-email").value = c.email;
  document.getElementById("c-telefone").value = c.telefone || "";
  document.getElementById("c-endereco").value = c.endereco || "";
}

async function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente?")) return;

  try {
    const response = await fetch(`${API_URL}/api/clientes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      listarClientes();
      mostrarAlerta("Cliente excluído com sucesso!");
    } else {
      mostrarAlerta("Erro ao excluir cliente");
    }
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao excluir cliente");
  }
}

function limparFormCliente() {
  document.getElementById("form-cliente").reset();
  editandoCliente = null;
}

async function verHistoricoCliente(id) {
  try {
    const response = await fetch(`${API_URL}/api/clientes/${id}/historico`);
    const historico = await response.json();

    const clienteResponse = await fetch(`${API_URL}/api/clientes`);
    const clientes = await clienteResponse.json();
    const cliente = clientes.find((c) => c.id === id);

    let msg = `Histórico de ${cliente.nome}:\n\n`;
    if (historico.length === 0) {
      msg += "Nenhuma locação encontrada.";
    } else {
      historico.forEach((l, i) => {
        msg += `${i + 1}. ${l.marca} ${l.modelo} - R$ ${parseFloat(
          l.valor_total
        ).toFixed(2)} - ${l.status}\n`;
      });
    }
    alert(msg);
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao buscar histórico");
  }
}

// ========== LOCAÇÕES ==========

async function atualizarSelectClientes() {
  try {
    const response = await fetch(`${API_URL}/api/clientes`);
    const clientes = await response.json();

    let html = '<option value="">Selecione...</option>';
    clientes.forEach((c) => {
      html += `<option value="${c.id}">${c.nome} - ${c.cpf}</option>`;
    });
    document.getElementById("l-cliente").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
  }
}

async function atualizarSelectVeiculos() {
  try {
    const response = await fetch(`${API_URL}/api/veiculos`);
    const veiculos = await response.json();

    let html = '<option value="">Selecione...</option>';
    veiculos
      .filter((v) => v.disponivel)
      .forEach((v) => {
        html += `<option value="${v.id}" data-preco="${v.preco_diaria}">${
          v.marca
        } ${v.modelo} - R$ ${parseFloat(v.preco_diaria).toFixed(
          2
        )}/dia</option>`;
      });
    document.getElementById("l-veiculo").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
  }
}

function calcularValor() {
  const veiculoSelect = document.getElementById("l-veiculo");
  const inicio = document.getElementById("l-inicio").value;
  const fim = document.getElementById("l-fim").value;

  if (veiculoSelect.value && inicio && fim) {
    const preco = parseFloat(veiculoSelect.selectedOptions[0].dataset.preco);
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const dias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
    const valor = dias * preco;
    document.getElementById("l-valor").value = "R$ " + valor.toFixed(2);
  }
}

async function salvarLocacao(e) {
  e.preventDefault();

  const veiculoId = parseInt(document.getElementById("l-veiculo").value);
  const clienteId = parseInt(document.getElementById("l-cliente").value);
  const inicio = document.getElementById("l-inicio").value;
  const fim = document.getElementById("l-fim").value;
  const valorTexto = document.getElementById("l-valor").value;
  const valor = parseFloat(valorTexto.replace("R$ ", ""));

  const locacao = {
    veiculoId,
    clienteId,
    inicio,
    fim,
    valor,
    status: editandoLocacao ? editandoLocacao.status : "ativa",
  };

  try {
    const url = editandoLocacao
      ? `${API_URL}/api/locacoes/${editandoLocacao.id}`
      : `${API_URL}/api/locacoes`;

    const method = editandoLocacao ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locacao),
    });

    if (response.ok) {
      limparFormLocacao();
      listarLocacoes();
      mostrarAlerta("Locação salva com sucesso!");
    } else {
      mostrarAlerta("Erro ao salvar locação");
    }
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao salvar locação");
  }
}

async function listarLocacoes() {
  try {
    const response = await fetch(`${API_URL}/api/locacoes`);
    const locacoes = await response.json();

    let html =
      "<table><tr><th>Cliente</th><th>Veículo</th><th>Início</th><th>Fim</th><th>Valor</th><th>Status</th><th>Ações</th></tr>";

    locacoes.forEach((l) => {
      const dataInicio = new Date(l.data_inicio).toLocaleString("pt-BR");
      const dataFim = new Date(l.data_fim).toLocaleString("pt-BR");

      html += `<tr>
        <td>${l.cliente_nome}</td>
        <td>${l.marca} ${l.modelo}</td>
        <td>${dataInicio}</td>
        <td>${dataFim}</td>
        <td>R$ ${parseFloat(l.valor_total).toFixed(2)}</td>
        <td><span class="badge badge-success">${l.status}</span></td>
        <td>
          <button class="btn btn-warning" onclick='editarLocacao(${JSON.stringify(
            l
          )})'>Editar</button>
          <button class="btn btn-danger" onclick="cancelarLocacao(${
            l.id
          })">Cancelar</button>
        </td>
      </tr>`;
    });

    html += "</table>";
    document.getElementById("lista-locacoes").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao carregar locações");
  }
}

function editarLocacao(l) {
  editandoLocacao = l;
  document.getElementById("l-cliente").value = l.cliente_id;
  document.getElementById("l-veiculo").value = l.veiculo_id;
  document.getElementById("l-inicio").value = l.data_inicio.slice(0, 16);
  document.getElementById("l-fim").value = l.data_fim.slice(0, 16);
  document.getElementById("l-valor").value =
    "R$ " + parseFloat(l.valor_total).toFixed(2);
}

async function cancelarLocacao(id) {
  if (!confirm("Deseja realmente cancelar esta locação?")) return;

  try {
    const response = await fetch(`${API_URL}/api/locacoes/${id}/cancelar`, {
      method: "PATCH",
    });

    if (response.ok) {
      listarLocacoes();
      mostrarAlerta("Locação cancelada com sucesso!");
    } else {
      mostrarAlerta("Erro ao cancelar locação");
    }
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao cancelar locação");
  }
}

function limparFormLocacao() {
  document.getElementById("form-locacao").reset();
  editandoLocacao = null;
}

// ========== ÁREA DO CLIENTE ==========

async function atualizarSelectClientesArea() {
  try {
    const response = await fetch(`${API_URL}/api/clientes`);
    const clientes = await response.json();

    let html = '<option value="">Selecione...</option>';
    clientes.forEach((c) => {
      html += `<option value="${c.id}">${c.nome} - ${c.cpf}</option>`;
    });
    document.getElementById("select-cliente-area").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
  }
}

async function carregarAreaCliente() {
  const clienteId = parseInt(
    document.getElementById("select-cliente-area").value
  );

  if (!clienteId) {
    document.getElementById("info-area-cliente").innerHTML = "";
    return;
  }

  try {
    const clienteResponse = await fetch(`${API_URL}/api/clientes`);
    const clientes = await clienteResponse.json();
    const cliente = clientes.find((c) => c.id === clienteId);

    const historicoResponse = await fetch(
      `${API_URL}/api/clientes/${clienteId}/historico`
    );
    const minhasLocacoes = await historicoResponse.json();

    let html = "<h3>Meus Dados</h3>";
    html += `<p><strong>Nome:</strong> ${cliente.nome}</p>`;
    html += `<p><strong>CPF:</strong> ${cliente.cpf}</p>`;
    html += `<p><strong>Email:</strong> ${cliente.email}</p>`;
    html += `<p><strong>Telefone:</strong> ${cliente.telefone || "-"}</p>`;
    html += `<p><strong>Endereço:</strong> ${cliente.endereco || "-"}</p>`;
    html += `<button class="btn btn-primary" onclick='editarMeusDados(${JSON.stringify(
      cliente
    )})'>Editar Dados</button>`;

    html += "<h3>Minhas Locações</h3>";
    if (minhasLocacoes.length === 0) {
      html += "<p>Você ainda não possui locações.</p>";
    } else {
      html +=
        "<table><tr><th>Veículo</th><th>Início</th><th>Fim</th><th>Valor</th><th>Status</th></tr>";
      minhasLocacoes.forEach((l) => {
        html += `<tr>
          <td>${l.marca} ${l.modelo}</td>
          <td>${new Date(l.data_inicio).toLocaleString("pt-BR")}</td>
          <td>${new Date(l.data_fim).toLocaleString("pt-BR")}</td>
          <td>R$ ${parseFloat(l.valor_total).toFixed(2)}</td>
          <td><span class="badge badge-success">${l.status}</span></td>
        </tr>`;
      });
      html += "</table>";
    }

    document.getElementById("info-area-cliente").innerHTML = html;
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao carregar área do cliente");
  }
}

function editarMeusDados(cliente) {
  mostrarSecao("clientes");
  editarCliente(cliente);
}

// Inicializar ao carregar
window.onload = function () {
  listarVeiculos();
};

