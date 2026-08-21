import axios from "axios";

interface Config {
  readonly apiUrl: string;
}

export let config: Config = {
  apiUrl: "",
};

export async function loadConfig() {
  if (import.meta.env.DEV !== true) {
    const fetched = await axios.get<Config>("./config.json");
    config = fetched.data!;
  } else {
    config = {
      apiUrl: import.meta.env["VITE_API_URL"],
    };
  }
}
