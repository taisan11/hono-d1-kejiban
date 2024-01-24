import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { dataConfirmation } from "./datasee";
import { post, threads } from "./schema";
import * as schema from "./schema";

type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

/////////////////////////////////////////
//       GET系(以下)
////////////////////////////////////////
app.get("/", (c) => {
	return c.text("Hello Hono!");
});
app.get("/api/threads", async (c) => {
	const db = drizzle(c.env.DB, { schema });
	const result = await db.select().from(threads).limit(10).execute(); // 最初の10個のレコードを取得
	console.debug(result);
	return c.json(result.map((record) => ({ [record.id]: record.title })));
});
// thread(Json)
app.get("/api/threads/:threadid", async (c) => {
	const threadidIn = c.req.param("threadid");
	const threadidDate = parseInt(threadidIn);

	const db = drizzle(c.env.DB);
	const result = await db
		.select()
		.from(threads)
		.where(eq(threads.id, threadidDate))
		.execute();
	const result2 = await db.select().from(post).where(eq(post.id, threadidDate));
	return c.json(result2);
});
// res(Json)
app.get("/api/threads/:threadid/:resid", (c) => {
	return c.text("ものすごいやつ");
});
/////////////////////////////////////////
//     POST系(以下)
////////////////////////////////////////
// respost(Json)
app.post("/api/post/:threadid", async (c) => {
	// dataの確認
	if (await dataConfirmation(c, true)) {
		return dataConfirmation(c, true);
	}
	const body = await c.req.json();
	const db = drizzle(c.env.DB, { schema });
	if (!body.id) {
		return c.text("すれIDがないよ");
	}
	//スレッドにレスを追加
	console.debug(body.id);
	let resulta = await db.query.post.findFirst({
		where: (post, { eq }) => eq(post.id, body.id),
		orderBy: (post, { desc }) => [desc(post.res_id)],
	});
	if (!resulta) {
		//@ts-ignore
		resulta = { res_id: 1 }; // resultaがundefinedの場合に新しいオブジェクトを代入
	}
	console.debug(resulta);
	if (!resulta) {
		// レコードが存在しない場合の処理をここに書く
		return c.text("指定されたIDのレコードが存在しません");
	}
	const record = resulta; // 最初のレコードを取得
	const ex_id = Number(
		`${record.res_id + 1}${body.id}${Math.floor(Math.random() * 88) + 10}`,
	);
	const res_id = Number(`${record.res_id + 1}`);
	const id = Number(`${body.id}`);
	console.debug(body.mail);
	//@ts-ignore
	let kextuka;
	if (!body.mail) {
		console.debug("mailないよ");
		kextuka = await db
			.insert(post)
			.values({
				ex_id: ex_id,
				id: id,
				res_id: res_id,
				name: body.name,
				message: body.message,
				createdAt: new Date().toISOString(),
				ip_addr: body.ip_addr,
				// user_id: body.user_id,
			})
			.execute();
	} else {
		console.debug("mailあるよ");
		kextuka = await db
			.insert(post)
			.values({
				ex_id: ex_id,
				id: body.id,
				res_id: record.res_id + 1,
				name: body.name,
				mail: body.mail,
				message: body.message,
				createdAt: new Date().toISOString(),
				ip_addr: body.ip_addr,
				// user_id: body.user_id,
			})
			.execute();
	}
	return c.text(String(kextuka.success));
});
// newThread(Json)
app.post("/api/newThread", async (c) => {
	if (await dataConfirmation(c, false)) {
		return dataConfirmation(c, false);
	}
	const body = await c.req.json();
	const db = drizzle(c.env.DB, { schema });
	if (!body.title) {
		return c.text("すれタイがないよ");
	}
	const date = new Date();
	const UnixTime = date.getTime();
	//スレッド一覧にスレッドを追加
	const result = await db
		.insert(threads)
		.values({
			id: UnixTime,
			title: body.title,
			createdAt: new Date().toISOString(),
			ip_addr: body.ip_addr,
		})
		.returning({ insertedId: threads.id })
		.execute();
	//スレッドにレスを追加
	console.debug(result[0].insertedId);
	let resulta = await db.query.post.findFirst({
		where: (post, { eq }) => eq(post.id, result[0].insertedId),
		orderBy: (post, { desc }) => [desc(post.res_id)],
	});
	if (!resulta) {
		//@ts-ignore
		resulta = { res_id: 1 }; // resultaがundefinedの場合に新しいオブジェクトを代入
	}
	console.debug(resulta);
	if (!resulta) {
		// レコードが存在しない場合の処理をここに書く
		return c.text("指定されたIDのレコードが存在しません");
	}
	const record = resulta; // 最初のレコードを取得
	const ex_id = Number(
		`${record.res_id + 1}${body.id}${Math.floor(Math.random() * 88) + 10}`,
	);
	const res_id = Number(`${record.res_id}`); //Qなぜ+1しないの?A.2になってしまうからだよ
	const id = Number(`${result[0].insertedId}`);
	console.debug(body.mail);
	if (!body.mail) {
		console.debug("mailないよ");
		await db
			.insert(post)
			.values({
				ex_id: ex_id,
				id: id,
				res_id: res_id,
				name: body.name,
				message: body.message,
				createdAt: new Date().toISOString(),
				ip_addr: body.ip_addr,
				// user_id: body.user_id,
			})
			.execute();
	} else {
		console.debug("mailあるよ");
		await db
			.insert(post)
			.values({
				ex_id: ex_id,
				id: body.id,
				res_id: record.res_id + 1,
				name: body.name,
				mail: body.mail,
				message: body.message,
				createdAt: new Date().toISOString(),
				ip_addr: body.ip_addr,
				// user_id: body.user_id,
			})
			.execute();
	}
	// postfunc(c,result[0].insertedId)
	return c.json(result);
});

export default app;
