// Simple Weather API Fetcher TypeScript Project
import * as https from "https";

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  timestamp: Date;
}

interface WeatherResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
}

class WeatherFetcher {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    // デモ用のモックデータを使用（実際のAPIキーがない場合）
    this.apiKey = apiKey || "demo";
    this.baseUrl = "api.openweathermap.org";
  }

  /**
   * 都市名で天気情報を取得
   */
  async getWeatherByCity(city: string): Promise<WeatherResponse> {
    if (this.apiKey === "demo") {
      return this.getMockWeatherData(city);
    }

    try {
      const url = `/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=ja`;
      const data = await this.makeHttpsRequest(this.baseUrl, url);
      const parsed = JSON.parse(data);

      const weatherData: WeatherData = {
        location: `${parsed.name}, ${parsed.sys.country}`,
        temperature: Math.round(parsed.main.temp),
        description: parsed.weather[0].description,
        humidity: parsed.main.humidity,
        windSpeed: parsed.wind.speed,
        timestamp: new Date(),
      };

      return { success: true, data: weatherData };
    } catch (error) {
      return {
        success: false,
        error: `天気情報の取得に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * 複数の都市の天気を一括取得
   */
  async getMultipleCitiesWeather(cities: string[]): Promise<WeatherResponse[]> {
    const promises = cities.map((city) => this.getWeatherByCity(city));
    return Promise.all(promises);
  }

  /**
   * 天気データをフォーマットして表示
   */
  formatWeatherDisplay(weather: WeatherData): string {
    const temp =
      weather.temperature > 0
        ? `+${weather.temperature}`
        : weather.temperature.toString();
    const tempIcon =
      weather.temperature > 25 ? "🌡️" : weather.temperature > 15 ? "🌤️" : "❄️";

    return `
📍 ${weather.location}
${tempIcon} 気温: ${temp}°C
☁️ 状況: ${weather.description}
💧 湿度: ${weather.humidity}%
💨 風速: ${weather.windSpeed} m/s
🕒 取得時刻: ${weather.timestamp.toLocaleString()}
`;
  }

  /**
   * 天気に基づく服装アドバイス
   */
  getClothingAdvice(temperature: number): string {
    if (temperature >= 25) {
      return "👕 軽装がおすすめです（Tシャツ、短パンなど）";
    } else if (temperature >= 20) {
      return "👔 長袖シャツがちょうど良いでしょう";
    } else if (temperature >= 15) {
      return "🧥 軽いジャケットを持参することをお勧めします";
    } else if (temperature >= 10) {
      return "🧥 暖かいコートが必要です";
    } else {
      return "🧥❄️ 厚手のコートと防寒対策をしっかりと！";
    }
  }

  private getMockWeatherData(city: string): WeatherResponse {
    // デモ用のモックデータ
    const mockData: Record<string, WeatherData> = {
      tokyo: {
        location: "東京, JP",
        temperature: 22,
        description: "晴れ",
        humidity: 65,
        windSpeed: 3.2,
        timestamp: new Date(),
      },
      osaka: {
        location: "大阪, JP",
        temperature: 24,
        description: "曇り",
        humidity: 70,
        windSpeed: 2.8,
        timestamp: new Date(),
      },
      kyoto: {
        location: "京都, JP",
        temperature: 20,
        description: "小雨",
        humidity: 80,
        windSpeed: 1.5,
        timestamp: new Date(),
      },
    };

    const cityKey = city.toLowerCase();
    const data = mockData[cityKey] || {
      location: `${city}, Unknown`,
      temperature: Math.floor(Math.random() * 30) + 5, // 5-35度
      description: ["晴れ", "曇り", "雨", "雪"][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.round(Math.random() * 10 * 10) / 10, // 0-10 m/s
      timestamp: new Date(),
    };

    return { success: true, data };
  }

  private makeHttpsRequest(hostname: string, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        path,
        method: "GET",
        headers: {
          "User-Agent": "Weather-Fetcher-TS/1.0",
        },
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      req.end();
    });
  }
}

// デモンストレーション
async function demonstrateWeatherFetcher(): Promise<void> {
  const fetcher = new WeatherFetcher();

  console.log("=== 天気情報取得ツール デモ ===\n");
  console.log("⚠️ デモモード（モックデータを使用）\n");

  // 単一都市の天気を取得
  console.log("🌍 単一都市の天気情報:");
  const tokyoWeather = await fetcher.getWeatherByCity("tokyo");

  if (tokyoWeather.success && tokyoWeather.data) {
    console.log(fetcher.formatWeatherDisplay(tokyoWeather.data));
    console.log(fetcher.getClothingAdvice(tokyoWeather.data.temperature));
  } else {
    console.log(`❌ エラー: ${tokyoWeather.error}`);
  }

  // 複数都市の天気を取得
  console.log("\n🌏 複数都市の天気情報:");
  const cities = ["tokyo", "osaka", "kyoto"];
  const multipleWeather = await fetcher.getMultipleCitiesWeather(cities);

  multipleWeather.forEach((weather, index) => {
    if (weather.success && weather.data) {
      console.log(`\n📍 ${cities[index].toUpperCase()}:`);
      console.log(`   気温: ${weather.data.temperature}°C`);
      console.log(`   状況: ${weather.data.description}`);
      console.log(`   湿度: ${weather.data.humidity}%`);
    } else {
      console.log(`❌ ${cities[index]}: ${weather.error}`);
    }
  });

  console.log("\n💡 実際のAPIを使用するには:");
  console.log("1. OpenWeatherMapでAPIキーを取得");
  console.log('2. new WeatherFetcher("your-api-key") でインスタンス作成');
  console.log("3. APIキーを環境変数 WEATHER_API_KEY に設定することを推奨");
}

// コマンドライン引数処理
async function handleCommandLineArgs(): Promise<void> {
  const args = process.argv.slice(2);

  // 環境変数からAPIキーを取得
  const apiKey = process.env.WEATHER_API_KEY;
  const fetcher = new WeatherFetcher(apiKey);

  if (args.length === 0) {
    await demonstrateWeatherFetcher();
    return;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case "get":
    case "weather":
      if (args.length < 2) {
        console.log("使用法: npm run dev get <都市名>");
        return;
      }
      const city = args[1];
      const weather = await fetcher.getWeatherByCity(city);

      if (weather.success && weather.data) {
        console.log(fetcher.formatWeatherDisplay(weather.data));
        console.log(fetcher.getClothingAdvice(weather.data.temperature));
      } else {
        console.log(`❌ エラー: ${weather.error}`);
      }
      break;

    case "multiple":
      if (args.length < 2) {
        console.log("使用法: npm run dev multiple 都市1 都市2 都市3...");
        return;
      }
      const targetCities = args.slice(1);
      const results = await fetcher.getMultipleCitiesWeather(targetCities);

      results.forEach((result, index) => {
        console.log(`\n📍 ${targetCities[index]}:`);
        if (result.success && result.data) {
          console.log(
            `   気温: ${result.data.temperature}°C (${result.data.description})`
          );
        } else {
          console.log(`   ❌ ${result.error}`);
        }
      });
      break;

    default:
      console.log("使用可能なコマンド:");
      console.log("  get <都市名> - 指定都市の天気を取得");
      console.log("  multiple <都市1> <都市2> ... - 複数都市の天気を取得");
      console.log("\n環境変数:");
      console.log("  WEATHER_API_KEY - OpenWeatherMap APIキー");
  }
}

// メイン実行
if (require.main === module) {
  handleCommandLineArgs().catch((error) => {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  });
}

export { WeatherFetcher, type WeatherData, type WeatherResponse };