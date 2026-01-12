import { VercelRequest, VercelResponse } from '@vercel/node';

// Order Storage (in-memory for now, can be upgraded to database)
interface Order {
  id: string;
  type: 'buy' | 'sell';
  tokenMint: string;
  amount: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: Date;
  executedAt?: Date;
}

interface PriceData {
  mint: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: Date;
}

interface TradingStrategy {
  id: string;
  name: string;
  enabled: boolean;
  type: 'dca' | 'momentum' | 'grid' | 'custom';
  tokenMint: string;
  parameters: Record<string, any>;
}

class SolanaDeFiPlugin {
  private orders: Map<string, Order> = new Map();
  private priceData: Map<string, PriceData[]> = new Map();
  private strategies: Map<string, TradingStrategy> = new Map();

  // Order Management
  async placeOrder(type: 'buy' | 'sell', tokenMint: string, amount: number, price: number) {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const order: Order = {
      id: orderId,
      type,
      tokenMint,
      amount,
      price,
      status: 'pending',
      createdAt: new Date(),
    };

    this.orders.set(orderId, order);
    return {
      success: true,
      orderId,
      message: `✅ ${type.toUpperCase()} order created\n\n**Order ID:** ${orderId}\n**Token:** ${tokenMint}\n**Amount:** ${amount}\n**Price:** ${price} SOL\n**Status:** Pending`,
    };
  }

  async getActiveOrders() {
    const activeOrders = Array.from(this.orders.values()).filter(o => o.status === 'pending');
    const orderDetails = activeOrders.map(o => `• **${o.type.toUpperCase()}** ${o.amount} units at ${o.price} SOL (ID: ${o.id.substr(0, 8)}...)`).join('\n');
    
    return {
      success: true,
      orders: activeOrders,
      message: activeOrders.length === 0 
        ? '📊 No active orders at the moment'
        : `📋 Active Orders (${activeOrders.length}):\n\n${orderDetails}`,
    };
  }

  async cancelOrder(orderId: string) {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: `❌ Order not found: ${orderId}` };
    }
    if (order.status !== 'pending') {
      return { success: false, message: `❌ Cannot cancel order with status: ${order.status}` };
    }
    order.status = 'cancelled';
    return { success: true, message: `✅ Order cancelled: ${orderId}` };
  }

  // Price Monitoring
  async getTokenPrice(mint: string): Promise<PriceData | null> {
    if (mint === 'So11111111111111111111111111111111111111111' || mint === 'sol') {
      return { mint, symbol: 'SOL', price: 185.5, change24h: 2.5, volume24h: 1500000000, timestamp: new Date() };
    }
    if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mint === 'usdc') {
      return { mint, symbol: 'USDC', price: 1.0, change24h: 0.01, volume24h: 500000000, timestamp: new Date() };
    }
    if (mint.includes('Bonk') || mint === 'DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8') {
      return { mint, symbol: 'BONK', price: 0.000042, change24h: 5.2, volume24h: 2300000, timestamp: new Date() };
    }
    return { mint, symbol: mint.substring(0, 8).toUpperCase(), price: 0.01, change24h: 0, volume24h: 0, timestamp: new Date() };
  }

  async getPriceHistory(mint: string, limit: number = 24) {
    const history = this.priceData.get(mint) || [];
    return history.slice(-limit);
  }

  async recordPrice(mint: string, priceData: PriceData) {
    if (!this.priceData.has(mint)) {
      this.priceData.set(mint, []);
    }
    const history = this.priceData.get(mint)!;
    history.push(priceData);
    if (history.length > 1000) {
      history.shift();
    }
  }

  // Trading Strategies
  async createStrategy(name: string, type: 'dca' | 'momentum' | 'grid' | 'custom', tokenMint: string, parameters: Record<string, any>) {
    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const strategy: TradingStrategy = { id: strategyId, name, type, tokenMint, enabled: false, parameters };
    this.strategies.set(strategyId, strategy);
    return {
      success: true,
      strategyId,
      message: `✅ Strategy created: ${name}\n\n**Type:** ${type}\n**Token:** ${tokenMint}\n**Status:** Inactive (enable to start trading)`,
    };
  }

  async toggleStrategy(strategyId: string, enabled: boolean) {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      return { success: false, message: `❌ Strategy not found: ${strategyId}` };
    }
    strategy.enabled = enabled;
    return { success: true, message: `✅ Strategy ${enabled ? 'enabled' : 'disabled'}: ${strategy.name}` };
  }

  async executeStrategy(strategyId: string) {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      return { success: false, message: `❌ Strategy not found: ${strategyId}` };
    }
    if (!strategy.enabled) {
      return { success: false, message: `❌ Strategy is disabled: ${strategy.name}` };
    }

    if (strategy.type === 'dca') {
      const order = await this.placeOrder('buy', strategy.tokenMint, strategy.parameters.amount, 0);
      return { success: order.success, message: `💰 DCA Order placed\n\n${order.message}` };
    }

    const priceData = await this.getTokenPrice(strategy.tokenMint);
    if (!priceData) {
      return { success: false, message: `❌ Could not fetch price data` };
    }

    if (strategy.type === 'momentum') {
      const change = priceData.change24h;
      if (Math.abs(change) > strategy.parameters.threshold) {
        const action = change > 0 ? 'sell' : 'buy';
        const order = await this.placeOrder(action as 'buy' | 'sell', strategy.tokenMint, strategy.parameters.amount, priceData.price);
        return { success: order.success, message: `📈 Momentum triggered (${change.toFixed(2)}%)\n\n${order.message}` };
      }
      return { success: true, message: `📊 Momentum check: ${change.toFixed(2)}% (threshold: ${strategy.parameters.threshold}%) - No action needed` };
    }

    return { success: false, message: `❌ Unknown strategy type: ${strategy.type}` };
  }

  async getStrategies() {
    return Array.from(this.strategies.values());
  }

  async getStrategyDetails(strategyId: string) {
    return this.strategies.get(strategyId) || null;
  }
}

// Singleton instance
const solanaDeFiPlugin = new SolanaDeFiPlugin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, body, query } = req;

  try {
    // Order Management Routes
    if (method === 'POST' && body.action === 'place_order') {
      const { type, tokenMint, amount, price } = body;
      const result = await solanaDeFiPlugin.placeOrder(type, tokenMint, amount, price);
      return res.status(200).json(result);
    }

    if (method === 'GET' && query.action === 'get_active_orders') {
      const result = await solanaDeFiPlugin.getActiveOrders();
      return res.status(200).json(result);
    }

    if (method === 'POST' && body.action === 'cancel_order') {
      const { orderId } = body;
      const result = await solanaDeFiPlugin.cancelOrder(orderId);
      return res.status(200).json(result);
    }

    // Price Monitoring Routes
    if (method === 'GET' && query.action === 'get_price') {
      const { mint } = query;
      const priceData = await solanaDeFiPlugin.getTokenPrice(mint as string);
      return res.status(200).json({
        success: priceData !== null,
        data: priceData,
        message: priceData ? `✅ Current price for ${mint}` : `❌ Could not fetch price`,
      });
    }

    if (method === 'GET' && query.action === 'get_price_history') {
      const { mint, limit } = query;
      const history = await solanaDeFiPlugin.getPriceHistory(mint as string, parseInt(limit as string) || 24);
      return res.status(200).json({
        success: true,
        data: history,
        message: `✅ Price history for ${mint}`,
      });
    }

    // Trading Strategy Routes
    if (method === 'POST' && body.action === 'create_strategy') {
      const { name, type, tokenMint, parameters } = body;
      const result = await solanaDeFiPlugin.createStrategy(name, type, tokenMint, parameters);
      return res.status(200).json(result);
    }

    if (method === 'GET' && query.action === 'get_strategies') {
      const strategies = await solanaDeFiPlugin.getStrategies();
      return res.status(200).json({
        success: true,
        strategies,
        message: `✅ Retrieved ${strategies.length} strategies`,
      });
    }

    if (method === 'POST' && body.action === 'toggle_strategy') {
      const { strategyId, enabled } = body;
      const result = await solanaDeFiPlugin.toggleStrategy(strategyId, enabled);
      return res.status(200).json(result);
    }

    if (method === 'POST' && body.action === 'execute_strategy') {
      const { strategyId } = body;
      const result = await solanaDeFiPlugin.executeStrategy(strategyId);
      return res.status(200).json(result);
    }

    if (method === 'GET' && query.action === 'get_strategy_details') {
      const { strategyId } = query;
      const strategy = await solanaDeFiPlugin.getStrategyDetails(strategyId as string);
      return res.status(200).json({
        success: strategy !== null,
        strategy,
        message: strategy ? '✅ Strategy details retrieved' : '❌ Strategy not found',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid action or method',
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
