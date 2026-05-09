import { useMemo } from "react";
import { Switch, Empty, Button } from "@agentscope-ai/design";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useTools } from "./useTools";
import { useTranslation } from "react-i18next";
import type { ToolInfo } from "../../../api/modules/tools";
import { PageHeader } from "@/components/PageHeader";
import { CopawWorkbenchShell } from "@/components/CopawWorkbenchShell";
import { cbcCardStripeClass } from "@/utils/cbcCardTheme";
import styles from "./index.module.less";

/** Stable background colours for the initial-letter fallback icon. */
const ICON_PALETTE = [
  "#f56a00",
  "#7265e6",
  "#ffbf00",
  "#00a2ae",
  "#87d068",
  "#1890ff",
  "#eb2f96",
  "#722ed1",
];

function hashStringToIndex(value: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % mod;
}

/** Renders the emoji icon or a coloured initial-letter badge as fallback. */
function ToolIcon({ icon, name }: { icon: string; name: string }) {
  if (icon) {
    return <span>{icon}</span>;
  }
  const letter = name.charAt(0).toUpperCase();
  const backgroundColor =
    ICON_PALETTE[hashStringToIndex(name, ICON_PALETTE.length)];
  return (
    <span className={styles.toolIconFallback} style={{ backgroundColor }}>
      {letter}
    </span>
  );
}

export default function ToolsPage() {
  const { t } = useTranslation();
  const {
    tools,
    loading,
    batchLoading,
    toggleEnabled,
    toggleAsyncExecution,
    enableAll,
    disableAll,
  } = useTools();
  const handleToggle = (tool: ToolInfo) => {
    toggleEnabled(tool);
  };

  const hasDisabledTools = useMemo(
    () => tools.some((tool) => !tool.enabled),
    [tools],
  );
  const hasEnabledTools = useMemo(
    () => tools.some((tool) => tool.enabled),
    [tools],
  );

  return (
    <CopawWorkbenchShell>
      <div className={styles.toolsPage}>
        <PageHeader
          items={[{ title: t("nav.agent") }, { title: t("tools.title") }]}
          extra={
            <div className={styles.headerAction}>
              <Switch
                checked={hasEnabledTools && !hasDisabledTools}
                onChange={() => (hasDisabledTools ? enableAll() : disableAll())}
                disabled={batchLoading || loading}
                checkedChildren={t("tools.enableAll")}
                unCheckedChildren={t("tools.disableAll")}
              />
            </div>
          }
        />
        <div
          className={`${styles.toolsContainer} copaw-bench-main-section copaw-bench-main-section--scroll`}
        >
          {loading ? (
            <div className={styles.loading}>
              <p>{t("common.loading")}</p>
            </div>
          ) : tools.length === 0 ? (
            <Empty description={t("tools.emptyState")} />
          ) : (
            <div className="cbc-agent-grid">
              {tools.map((tool, index) => (
                <div
                  key={tool.name}
                  className={`cbc-card ${cbcCardStripeClass(index)}`}
                >
                  <div className="cbc-glow-layer" aria-hidden />
                  {tool.enabled ? (
                    <>
                      <div className="cbc-enabled-ring" aria-hidden />
                      <div className="cbc-spectrum" aria-hidden>
                        <span />
                      </div>
                    </>
                  ) : null}
                  <div className="cbc-card-inner">
                    <div className={styles.cardTopRow}>
                      <div className={styles.toolIconSlot}>
                        <ToolIcon icon={tool.icon} name={tool.name} />
                      </div>
                      <div className="cbc-status-pill">
                        <span
                          className={`cbc-status-dot${tool.enabled ? "" : " cbc-status-dot--off"}`}
                        />
                        <span
                          className={
                            tool.enabled
                              ? "cbc-status-text-on"
                              : "cbc-status-text-off"
                          }
                        >
                          {tool.enabled
                            ? t("common.enabled")
                            : t("common.disabled")}
                        </span>
                      </div>
                    </div>

                    <h3
                      className="card-title"
                      style={{ margin: "0 0 10px", fontSize: 16 }}
                    >
                      {tool.name}
                    </h3>

                    <div className="cbc-meta">
                      <p className={styles.toolDescription}>
                        {tool.description}
                      </p>
                    </div>

                    <div className="cbc-agent-card-actions">
                      {tool.name === "execute_shell_command" ? (
                        <Button
                          size="small"
                          onClick={() => toggleAsyncExecution(tool)}
                          disabled={!tool.enabled}
                          icon={
                            tool.async_execution ? (
                              <ThunderboltOutlined />
                            ) : (
                              <ClockCircleOutlined />
                            )
                          }
                        >
                          {tool.async_execution
                            ? t("tools.asyncExecutionEnabled")
                            : t("tools.asyncExecutionDisabled")}
                        </Button>
                      ) : null}
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => handleToggle(tool)}
                        icon={
                          tool.enabled ? (
                            <EyeInvisibleOutlined />
                          ) : (
                            <EyeOutlined />
                          )
                        }
                      >
                        {tool.enabled
                          ? t("common.disable")
                          : t("common.enable")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CopawWorkbenchShell>
  );
}
