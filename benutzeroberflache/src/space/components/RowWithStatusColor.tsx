export enum Color {
  RED = "RED",
  GREEN = "GREEN",
  BLUE = "BLUE",
}

interface RowWithStatusColor {
  statusColor: Color;
}

const toBgColor = (statusColor: Color): string => {
  switch (statusColor) {
    case Color.RED:
      return "bg-red-500";
    case Color.GREEN:
      return "bg-green-500";
    case Color.BLUE:
      return "bg-blue-500";
    default:
      throw new Error("Color " + statusColor + " not supported");
  }
};

export const RowWithStatusColor: React.FC<RowWithStatusColor> = ({ statusColor, children }) => {
  return (
    <div className="flex">
      <div className={"pl-2 py-4 mt-2 rounded-l shadow-lg " + toBgColor(statusColor)}></div>
      <div className="p-4 rounded-r shadow-xl bg-white mt-2 w-full">{children}</div>
    </div>
  );
};
