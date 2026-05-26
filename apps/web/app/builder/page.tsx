import {
  BuilderHeader,
  BuilderToolbar,
  BuilderInsertPanel,
  BuilderCanvas,
  BuilderInspector,
} from "~/components/builder";

export default function BuilderPage() {
  return (
    <div className="h-screen flex flex-col bg-[#121319] text-[#e4e1eb] overflow-hidden">
      <BuilderHeader />
      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        <BuilderToolbar />
        <BuilderInsertPanel />
        <BuilderCanvas />
        <BuilderInspector />
      </div>
    </div>
  );
}
