# Weather Fetch TypeScript

TypeScriptで作成された天気情報取得ツールです。OpenWeatherMap APIを使用して天気データを取得し、服装アドバイスも提供します。

## セットアップ

```bash
npm install
```

## 使い方

### 開発モード（デモを実行）

```bash
npm run dev
```

### 特定都市の天気を取得

```bash
npm run dev get Tokyo
npm run dev weather Osaka
```

### 複数都市の天気を一括取得

```bash
npm run dev multiple Tokyo Osaka Kyoto
```

## 機能

- **天気情報取得**: 都市名で天気データを取得
- **複数都市対応**: 一度に複数の都市の天気を取得
- **服装アドバイス**: 気温に基づく服装の提案
- **モックデータ**: APIキーなしでもデモ実行可能
- **エラーハンドリング**: 適切なエラー処理とメッセージ
- **日本語対応**: 日本語での天気情報表示

## API設定

実際のAPIを使用する場合：

1. [OpenWeatherMap](https://openweathermap.org/api)でAPIキーを取得
2. 環境変数を設定：
   ```bash
   export WEATHER_API_KEY="your-api-key-here"
   ```

## データ構造

```typescript
interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  timestamp: Date;
}
```

## 表示例

```
📍 東京, JP
🌤️ 気温: +22°C
☁️ 状況: 晴れ
💧 湿度: 65%
💨 風速: 3.2 m/s
🕒 取得時刻: 2024/1/1 12:00:00

👔 長袖シャツがちょうど良いでしょう
```

## API

### WeatherFetcher クラス

- `getWeatherByCity(city)`: 指定都市の天気を取得
- `getMultipleCitiesWeather(cities)`: 複数都市の天気を一括取得
- `formatWeatherDisplay(weather)`: 天気データの整形表示
- `getClothingAdvice(temperature)`: 服装アドバイスの生成

## 例

```typescript
import { WeatherFetcher } from "./src/index";

const fetcher = new WeatherFetcher("your-api-key");
const weather = await fetcher.getWeatherByCity("Tokyo");
console.log(weather.data?.temperature); // 22
```