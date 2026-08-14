import axios from "axios";

interface Config {
  readonly apiUrl: string;
}

export let config: Config = {
  apiUrl: "",
};

export async function loadConfig() {
  const fetched = await axios.get<Config>("./config.json");
  config = fetched.data!;
}
