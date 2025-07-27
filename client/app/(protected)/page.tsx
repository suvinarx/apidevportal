import dynamic from "next/dynamic";

const APICatalogView = dynamic(() => import("@/components/APICatalogView"), {
    ssr: false,
});

export default function HomePage() {
    return <APICatalogView role="user" />;
}
