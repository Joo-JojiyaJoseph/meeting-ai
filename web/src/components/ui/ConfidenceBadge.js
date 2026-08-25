import { jsx as _jsx } from "react/jsx-runtime";
import { Badge } from "./Badge";
const map = {
    high: { tone: "success", label: "High confidence" },
    medium: { tone: "warning", label: "Medium confidence" },
    low: { tone: "danger", label: "Low confidence" },
};
export function ConfidenceBadge({ level }) {
    if (!level)
        return null;
    const { tone, label } = map[level];
    return _jsx(Badge, { tone: tone, children: label });
}
