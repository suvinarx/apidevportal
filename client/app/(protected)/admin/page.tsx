import dynamic from "next/dynamic";

const APICatalogView = dynamic(() => import("@/components/APICatalogView"), {
    ssr: false,
});

export default function AdminPage() {
    return <APICatalogView role="admin" />;
}
