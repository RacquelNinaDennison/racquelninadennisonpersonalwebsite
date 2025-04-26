import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";
import { Resvg } from "@resvg/resvg-js";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import type { APIContext } from "astro";

const ogOptions: SatoriOptions = {
	fonts: [
		{
			data: Buffer.from(RobotoMono),
			name: "Roboto Mono",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(RobotoMonoBold),
			name: "Roboto Mono",
			style: "normal",
			weight: 700,
		},
	],
	width: 1200,
	height: 630,
};

const markup = (title: string, pubDate: string) => html`
<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
    <div tw="flex flex-col flex-1 w-full p-10 justify-center">
        <p tw="text-2xl mb-6">${pubDate}</p>
        <h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
    </div>
    <div tw="flex items-center justify-between w-full p-10 border-t border-[#2bbc89] text-xl">
        <div tw="flex items-center">
            <p tw="ml-3 font-semibold">${siteConfig.title}</p>
        </div>
        <p>by ${siteConfig.author}</p>
    </div>
</div>`;

export async function GET(context: APIContext) {
	const slug = context.params.slug as string;

	const posts = await getAllPosts();
	const post = posts.find((p) => p.id === slug);

	if (!post) {
		return new Response("Not Found", { status: 404 });
	}

	const pubDate = post.data.updatedDate ?? post.data.publishDate;
	const title = post.data.title;

	const formattedDate = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});

	const svg = await satori(markup(title, formattedDate), ogOptions);
	const png = new Resvg(svg).render().asPng();

	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
