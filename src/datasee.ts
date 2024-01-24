import { Context, Hono } from "hono";

// const app = new Hono<{ Bindings: Bindings }>()

export async function dataConfirmation(c: Context, a?: boolean) {
	if (!c.req.json) {
		return c.text("内容がないようです\n管理者に問い合わせてください");
	}
	let body;
	try {
		body = await c.req.json();
	} catch (error) {
		return c.text("無効なJSONデータです");
	}
	if (!body.name || !body.message || !body.ip_addr || !body.user_id) {
		return c.text("必要な項目がかけています");
	}
}