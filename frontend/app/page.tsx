"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Position = {
  id: number;
  portfolio_id: number;
  ticker: string;
  quantity: number;
  avg_price: number;
  notes: string;
};

type Portfolio = {
  id: number;
  user_id: number;
  name: string;
  positions: Position[];
};

type PortfolioListResponse = {
  items: Portfolio[];
};

type NewsItem = {
  ticker: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  tags: string[];
  published_at: string;
};

type PortfolioNewsResponse = {
  portfolio_id: number;
  grouped_news: Record<string, NewsItem[]>;
};

type Brief = {
  id: number;
  portfolio_id: number;
  generated_at: string;
  content: string;
  metadata_json: string;
};

type ChartPoint = {
  timestamp: string;
  close: number;
};

type ChartResponse = {
  ticker: string;
  range: string;
  points: ChartPoint[];
};

type PositionForm = {
  ticker: string;
  quantity: string;
  avg_price: string;
  notes: string;
};

type PriceSnapshot = {
  latest: number;
  previous: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const CHART_RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;

const defaultPositionForm: PositionForm = {
  ticker: "",
  quantity: "",
  avg_price: "",
  notes: "",
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [portfolioName, setPortfolioName] = useState("Core Portfolio");
  const [positionForm, setPositionForm] = useState<PositionForm>(defaultPositionForm);
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [news, setNews] = useState<Record<string, NewsItem[]>>({});
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  const [chartTicker, setChartTicker] = useState<string>("");
  const [chartRange, setChartRange] = useState<(typeof CHART_RANGES)[number]>("1M");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const [priceSnapshots, setPriceSnapshots] = useState<Record<string, PriceSnapshot>>({});

  const selectedPortfolio = useMemo(
    () => portfolios.find((portfolio) => portfolio.id === selectedPortfolioId) ?? null,
    [portfolios, selectedPortfolioId],
  );
  const selectedTickerKey = useMemo(
    () => (selectedPortfolio ? selectedPortfolio.positions.map((position) => position.ticker).sort().join(",") : ""),
    [selectedPortfolio],
  );

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedPortfolio) {
      return;
    }

    const tickers = selectedPortfolio.positions.map((position) => position.ticker);
    if (tickers.length > 0 && !tickers.includes(chartTicker)) {
      setChartTicker(tickers[0]);
    }
    if (tickers.length === 0) {
      setChartTicker("");
      setChartData([]);
    }

    void loadNews(selectedPortfolio.id);
    void loadBrief(selectedPortfolio.id);
    void loadPriceSnapshots(tickers);
  }, [selectedPortfolio?.id, selectedTickerKey]);

  useEffect(() => {
    if (!chartTicker) {
      return;
    }
    void loadChart(chartTicker, chartRange);
  }, [chartTicker, chartRange]);

  async function bootstrap(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const user = await apiRequest<{ id: number }>("/users/bootstrap-demo", { method: "POST" });
      setUserId(user.id);
      await refreshPortfolios();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshPortfolios(): Promise<void> {
    const response = await apiRequest<PortfolioListResponse>("/portfolios");
    setPortfolios(response.items);
    if (response.items.length > 0) {
      setSelectedPortfolioId((current) => current ?? response.items[0].id);
    } else {
      setSelectedPortfolioId(null);
    }
  }

  async function createPortfolio(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!userId || !portfolioName.trim()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await apiRequest<Portfolio>("/portfolios", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          name: portfolioName.trim(),
        }),
      });
      setPortfolioName("Core Portfolio");
      await refreshPortfolios();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePortfolio(): Promise<void> {
    if (!selectedPortfolio) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await apiRequest<void>(`/portfolios/${selectedPortfolio.id}`, { method: "DELETE" });
      setNews({});
      setBrief(null);
      await refreshPortfolios();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function upsertPosition(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedPortfolio || !positionForm.ticker.trim()) {
      return;
    }

    const payload = {
      ticker: positionForm.ticker.trim().toUpperCase(),
      quantity: Number(positionForm.quantity || 0),
      avg_price: Number(positionForm.avg_price || 0),
      notes: positionForm.notes.trim(),
    };

    setIsSaving(true);
    setError(null);
    try {
      if (editingPositionId) {
        await apiRequest<Position>(`/positions/${editingPositionId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest<Position>(`/portfolios/${selectedPortfolio.id}/positions`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setPositionForm(defaultPositionForm);
      setEditingPositionId(null);
      await refreshPortfolios();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function removePosition(positionId: number): Promise<void> {
    setIsSaving(true);
    setError(null);
    try {
      await apiRequest<void>(`/positions/${positionId}`, { method: "DELETE" });
      if (editingPositionId === positionId) {
        setEditingPositionId(null);
        setPositionForm(defaultPositionForm);
      }
      await refreshPortfolios();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  function startEditPosition(position: Position): void {
    setEditingPositionId(position.id);
    setPositionForm({
      ticker: position.ticker,
      quantity: String(position.quantity),
      avg_price: String(position.avg_price),
      notes: position.notes,
    });
  }

  async function loadNews(portfolioId: number): Promise<void> {
    setNewsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<PortfolioNewsResponse>(`/portfolios/${portfolioId}/news`);
      setNews(response.grouped_news);
    } catch (requestError) {
      setNews({});
      setError((requestError as Error).message);
    } finally {
      setNewsLoading(false);
    }
  }

  async function loadBrief(portfolioId: number): Promise<void> {
    setBriefLoading(true);
    setError(null);
    try {
      const response = await apiRequest<Brief>(`/portfolios/${portfolioId}/brief`);
      setBrief(response);
    } catch {
      setBrief(null);
    } finally {
      setBriefLoading(false);
    }
  }

  async function generateBrief(): Promise<void> {
    if (!selectedPortfolio) {
      return;
    }

    setBriefLoading(true);
    setError(null);
    try {
      const response = await apiRequest<Brief>(`/portfolios/${selectedPortfolio.id}/brief/generate`, {
        method: "POST",
      });
      setBrief(response);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBriefLoading(false);
    }
  }

  async function loadChart(ticker: string, range: (typeof CHART_RANGES)[number]): Promise<void> {
    setChartLoading(true);
    setError(null);
    try {
      const response = await apiRequest<ChartResponse>(`/charts/${ticker}?range=${range}`);
      setChartData(response.points);
      setHoverIndex(response.points.length > 0 ? response.points.length - 1 : null);
    } catch (requestError) {
      setChartData([]);
      setError((requestError as Error).message);
    } finally {
      setChartLoading(false);
    }
  }

  async function loadPriceSnapshots(tickers: string[]): Promise<void> {
    if (tickers.length === 0) {
      setPriceSnapshots({});
      return;
    }

    try {
      const entries = await Promise.all(
        tickers.map(async (ticker) => {
          const response = await apiRequest<ChartResponse>(`/charts/${ticker}?range=1D`);
          const latest = response.points.at(-1)?.close ?? 0;
          const previous = response.points.at(-2)?.close ?? latest;
          return [ticker, { latest, previous }] as const;
        }),
      );
      setPriceSnapshots(Object.fromEntries(entries));
    } catch {
      setPriceSnapshots({});
    }
  }

  const summary = useMemo(() => {
    if (!selectedPortfolio) {
      return {
        totalValue: 0,
        dailyPnl: 0,
        dailyPct: 0,
      };
    }

    let totalValue = 0;
    let previousValue = 0;

    for (const position of selectedPortfolio.positions) {
      const snapshot = priceSnapshots[position.ticker];
      const latestPrice = snapshot?.latest ?? position.avg_price;
      const previousPrice = snapshot?.previous ?? latestPrice;
      totalValue += latestPrice * position.quantity;
      previousValue += previousPrice * position.quantity;
    }

    const dailyPnl = totalValue - previousValue;
    const dailyPct = previousValue === 0 ? 0 : (dailyPnl / previousValue) * 100;
    return { totalValue, dailyPnl, dailyPct };
  }, [selectedPortfolio, priceSnapshots]);

  const chartStats = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, change: 0 };
    }
    const min = Math.min(...chartData.map((point) => point.close));
    const max = Math.max(...chartData.map((point) => point.close));
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    return { min, max, change: ((last - first) / first) * 100 };
  }, [chartData]);

  const chartPolyline = useMemo(() => {
    if (chartData.length === 0) {
      return "";
    }

    const width = 720;
    const height = 220;
    const padding = 20;
    const min = Math.min(...chartData.map((point) => point.close));
    const max = Math.max(...chartData.map((point) => point.close));
    const scaleX = (index: number) => padding + (index / Math.max(chartData.length - 1, 1)) * (width - padding * 2);
    const scaleY = (value: number) => {
      if (max === min) {
        return height / 2;
      }
      return padding + ((max - value) / (max - min)) * (height - padding * 2);
    };

    return chartData.map((point, index) => `${scaleX(index)},${scaleY(point.close)}`).join(" ");
  }, [chartData]);

  const hoveredPoint = hoverIndex !== null ? chartData[hoverIndex] : null;

  if (isLoading) {
    return <main className="mx-auto max-w-6xl px-6 py-12 text-slate-700">Loading dashboard...</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-6 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-100">Financial Market Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold">Portfolio Intelligence Dashboard</h1>
        <p className="mt-2 text-sm text-teal-100">
          Manage holdings, track movers, read relevant news, and generate a daily brief.
        </p>
      </header>

      {error && <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Value</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(summary.totalValue)}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Daily Gain/Loss</p>
          <p className={`mt-2 text-2xl font-semibold ${summary.dailyPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatCurrency(summary.dailyPnl)}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Daily Change</p>
          <p className={`mt-2 text-2xl font-semibold ${summary.dailyPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatPercent(summary.dailyPct)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Portfolio Management</h2>
            <button
              type="button"
              onClick={deletePortfolio}
              disabled={!selectedPortfolio || isSaving}
              className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700 disabled:opacity-40"
            >
              Delete Portfolio
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium">Select Portfolio</label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={selectedPortfolioId ?? ""}
              onChange={(event) => {
                const nextId = Number(event.target.value);
                if (!Number.isNaN(nextId)) {
                  setSelectedPortfolioId(nextId);
                }
              }}
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </option>
              ))}
            </select>

            <form className="flex gap-2" onSubmit={(event) => void createPortfolio(event)}>
              <input
                value={portfolioName}
                onChange={(event) => setPortfolioName(event.target.value)}
                placeholder="New portfolio name"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={!userId || isSaving}
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Create
              </button>
            </form>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Positions</h3>
            <form className="mt-3 grid gap-2 md:grid-cols-2" onSubmit={(event) => void upsertPosition(event)}>
              <input
                placeholder="Ticker"
                value={positionForm.ticker}
                onChange={(event) => setPositionForm((prev) => ({ ...prev, ticker: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Quantity"
                value={positionForm.quantity}
                onChange={(event) => setPositionForm((prev) => ({ ...prev, quantity: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Avg Price"
                value={positionForm.avg_price}
                onChange={(event) => setPositionForm((prev) => ({ ...prev, avg_price: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Notes"
                value={positionForm.notes}
                onChange={(event) => setPositionForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={!selectedPortfolio || isSaving}
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {editingPositionId ? "Update Position" : "Add Position"}
                </button>
                {editingPositionId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPositionId(null);
                      setPositionForm(defaultPositionForm);
                    }}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2">Ticker</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Avg</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPortfolio?.positions ?? []).map((position) => (
                    <tr key={position.id} className="border-b border-slate-100">
                      <td className="py-2 font-medium">{position.ticker}</td>
                      <td className="py-2">{position.quantity}</td>
                      <td className="py-2">{formatCurrency(position.avg_price)}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditPosition(position)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void removePosition(position.id)}
                            className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(selectedPortfolio?.positions.length ?? 0) === 0 && (
                <p className="pt-3 text-sm text-slate-500">No positions yet. Add your first ticker above.</p>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Daily Brief</h2>
            <button
              type="button"
              onClick={() => void generateBrief()}
              disabled={!selectedPortfolio || briefLoading}
              className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {briefLoading ? "Generating..." : "Generate Brief"}
            </button>
          </div>
          {briefLoading && <p className="mt-3 text-sm text-slate-500">Loading brief...</p>}
          {!briefLoading && !brief && (
            <p className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No brief found yet. Generate one for this portfolio.
            </p>
          )}
          {brief && (
            <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs text-slate-500">Generated: {new Date(brief.generated_at).toLocaleString()}</p>
              <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{brief.content}</pre>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Relevant News</h2>
          {newsLoading && <p className="mt-3 text-sm text-slate-500">Loading news...</p>}
          {!newsLoading && Object.keys(news).length === 0 && (
            <p className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No news available. Add positions to fetch ticker-specific headlines.
            </p>
          )}
          <div className="mt-3 max-h-[420px] space-y-4 overflow-auto pr-1">
            {Object.entries(news).map(([ticker, items]) => (
              <div key={ticker} className="rounded border border-slate-200 p-3">
                <p className="text-sm font-semibold">{ticker}</p>
                <div className="mt-2 space-y-2">
                  {items.map((item) => (
                    <article key={`${item.url}-${item.published_at}`} className="rounded bg-slate-50 p-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-cyan-700">
                        {item.title}
                      </a>
                      <p className="mt-1 text-xs text-slate-600">{item.summary}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.source} • {new Date(item.published_at).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Interactive Chart</h2>
            <div className="flex items-center gap-2">
              <select
                value={chartTicker}
                onChange={(event) => setChartTicker(event.target.value)}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              >
                {(selectedPortfolio?.positions ?? []).map((position) => (
                  <option key={position.id} value={position.ticker}>
                    {position.ticker}
                  </option>
                ))}
              </select>
              <div className="flex gap-1">
                {CHART_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setChartRange(range)}
                    className={`rounded px-2 py-1 text-xs ${
                      chartRange === range ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chartLoading && <p className="mt-3 text-sm text-slate-500">Loading chart...</p>}
          {!chartLoading && chartData.length === 0 && (
            <p className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Add holdings to visualize ticker chart data.
            </p>
          )}

          {chartData.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <p className="font-medium text-slate-800">
                  {chartTicker} {chartRange} • {formatPercent(chartStats.change)}
                </p>
                {hoveredPoint && (
                  <p className="text-slate-600">
                    {new Date(hoveredPoint.timestamp).toLocaleDateString()} • {formatCurrency(hoveredPoint.close)}
                  </p>
                )}
              </div>
              <svg
                viewBox="0 0 720 220"
                className="w-full rounded border border-slate-200 bg-slate-50"
                onMouseMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const x = event.clientX - bounds.left;
                  const index = Math.round((x / bounds.width) * Math.max(chartData.length - 1, 1));
                  setHoverIndex(Math.max(0, Math.min(index, chartData.length - 1)));
                }}
              >
                <polyline fill="none" stroke="#0f766e" strokeWidth="3" points={chartPolyline} />
                {hoverIndex !== null && chartData[hoverIndex] && (() => {
                  const width = 720;
                  const height = 220;
                  const padding = 20;
                  const min = chartStats.min;
                  const max = chartStats.max;
                  const x = padding + (hoverIndex / Math.max(chartData.length - 1, 1)) * (width - padding * 2);
                  const y =
                    max === min
                      ? height / 2
                      : padding + ((max - chartData[hoverIndex].close) / (max - min)) * (height - padding * 2);
                  return (
                    <>
                      <line x1={x} y1={12} x2={x} y2={208} stroke="#94a3b8" strokeDasharray="4 4" />
                      <circle cx={x} cy={y} r={5} fill="#0f766e" />
                    </>
                  );
                })()}
              </svg>
            </div>
          )}
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Allocation</h2>
        {(selectedPortfolio?.positions.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-slate-500">Allocation appears after adding positions.</p>
        )}
        {(selectedPortfolio?.positions ?? []).map((position) => {
          const currentPrice = priceSnapshots[position.ticker]?.latest ?? position.avg_price;
          const value = currentPrice * position.quantity;
          const weight = summary.totalValue === 0 ? 0 : (value / summary.totalValue) * 100;
          return (
            <div key={position.id} className="mt-3">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{position.ticker}</span>
                <span>{formatCurrency(value)} ({weight.toFixed(1)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600" style={{ width: `${weight}%` }} />
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
