const { readFileSync } = require('fs');

function gerarFaturaStr(fatura, pecas) {
  let totalFatura = 0;
  let creditos = 0;
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  function formatMoeda(valor) {
    return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
  }
  // Função query que substitui a variável local "peca"
  function getPeca(apresentacao) {
      return pecas[apresentacao.id];
  }
  //funcao extraida
  function calcularTotalApresentacao(apre, peca) {
    let total = 0;
    switch (peca.tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
           total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
          throw new Error(`Peça desconhecia: ${peca.tipo}`);
      }
      return total;

  }
  // créditos para próximas contrataçõs
  function calcularCreditos(apre) {
      let creditos = Math.max(apre.audiencia - 30, 0);
      if (getPeca(apre).tipo === "comedia") {
        creditos += Math.floor(apre.audiencia / 5);
      }
      return creditos;
    }

  for (let apre of fatura.apresentacoes) {
    const peca = getPeca(apre);
    let total = calcularTotalApresentacao(apre, peca);
    creditos += calcularCreditos(apre);

    faturaStr += `  ${peca.nome}: ${formatMoeda(total)} (${apre.audiencia} assentos)\n`;
    totalFatura += total;
    }

  faturaStr += `Valor total: ${formatMoeda(totalFatura)}\n`;
  faturaStr += `Créditos acumulados: ${creditos} \n`;
  return faturaStr;
  
  }

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);