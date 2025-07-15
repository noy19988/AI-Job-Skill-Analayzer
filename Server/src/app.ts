import appInit from "./server";
const port = process.env.PORT;

const tmpFunc = async () => {
  const app = await appInit();
  app.listen(port, () => {
    console.log(`Ai Jobb Skill Analyzer App listening at http://localhost:${port}`);
  });
};

tmpFunc();