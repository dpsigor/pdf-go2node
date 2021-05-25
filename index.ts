import { spawn } from "child_process";

interface pdfItem {
  Font: string;
  FontSize: number;
  X: number;
  Y: number;
  W: number;
  S: string;
}

interface goRow {
  Position: number;
  Content: pdfItem[];
}

type goPage = goRow[];

type LeituraRows = { [key: string]: pdfItem[][] };
type LeituraItens = { [key: string]: pdfItem[] };

const ls = spawn("./pdfextract");

ls.stdout.on("data", (data) => {
  const goData: goPage[] = JSON.parse(data);
  const paginas = goData.map((pg) => pg.map((PositionContentObj) => PositionContentObj.Content));
  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Caso queira separar as rows. Útil em casos de pdfs mal formatados (em que o Y varia um pouco)
  // e, portanto, queremos partir de itens separados desde o início.
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const leituraItens: LeituraItens = {};
  for (let i = 0; i < paginas.length; i++) {
    leituraItens[i] = [];
    for (const row of paginas[i]) {
      for (const item of row) {
        leituraItens[i].push(item);
      }
    }
  }
  console.log("Row dos headers na primeira página:");
  const pg1 = leituraItens["0"];
  const especificaDoTituloItem = pg1.find((item) => item.S.toUpperCase().includes("ESPECIFICA"));
  if (especificaDoTituloItem) {
    const headersRow = pg1.filter((item) => Math.abs(item.Y - especificaDoTituloItem.Y) < 5);
    console.log(headersRow);
  }
  ///////////////////////////////////////
  // Caso queria manter separado em rows:
  ///////////////////////////////////////
  const leituraRows: LeituraRows = {};
  for (let i = 0; i < paginas.length; i++) {
    leituraRows[i] = [];
    for (const row of paginas[i]) {
      leituraRows[i].push(row);
    }
  }
});

ls.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

ls.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

