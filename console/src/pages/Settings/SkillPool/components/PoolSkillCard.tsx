import { useState } from "react";
import { Button, Checkbox, Tooltip } from "@agentscope-ai/design";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { PoolSkillSpec } from "../../../../api/types";
import {
  getPoolBuiltinStatusLabel,
  getPoolBuiltinStatusTone,
  isSkillBuiltin,
} from "@/utils/skill";
import { cbcCardStripeClass } from "@/utils/cbcCardTheme";
import { getSkillVisual } from "../../../Agent/Skills/components";
import styles from "../index.module.less";

dayjs.extend(relativeTime);

interface PoolSkillCardProps {
  skill: PoolSkillSpec;
  /** Rotating accent stripe — 与工作区技能卡片一致 */
  cardIndex?: number;
  isSelected: boolean;
  batchModeEnabled: boolean;
  onToggleSelect: (name: string) => void;
  onEdit: (skill: PoolSkillSpec) => void;
  onBroadcast: (skill: PoolSkillSpec) => void;
  onDelete: (skill: PoolSkillSpec) => void;
}

export function PoolSkillCard({
  skill,
  cardIndex = 0,
  isSelected,
  batchModeEnabled,
  onToggleSelect,
  onEdit,
  onBroadcast,
  onDelete,
}: PoolSkillCardProps) {
  const { t } = useTranslation();
  const [isHover, setIsHover] = useState(false);
  const syncTone = getPoolBuiltinStatusTone(skill.sync_status);
  const isBuiltin = isSkillBuiltin(skill.source);
  const showSyncedGlow = skill.sync_status === "synced";
  const themeCls = cbcCardStripeClass(cardIndex);
  const selectedCls = isSelected ? "cbc-card--selected" : "";

  const statusDotClass =
    syncTone === "synced"
      ? "cbc-status-dot"
      : syncTone === "outdated"
        ? `cbc-status-dot ${styles.poolSyncDotOutdated}`
        : "cbc-status-dot cbc-status-dot--off";

  const statusTextClass =
    syncTone === "synced"
      ? "cbc-status-text-on"
      : syncTone === "outdated"
        ? styles.poolSyncTextOutdated
        : "cbc-status-text-off";

  const handleCardClick = () => {
    if (batchModeEnabled) {
      onToggleSelect(skill.name);
    } else {
      onEdit(skill);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`cbc-card ${themeCls} ${selectedCls}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (batchModeEnabled) {
            onToggleSelect(skill.name);
          } else {
            onEdit(skill);
          }
        }
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{ cursor: "pointer" }}
    >
      <div className="cbc-glow-layer" aria-hidden />
      {showSyncedGlow ? (
        <>
          <div className="cbc-enabled-ring" aria-hidden />
          <div className="cbc-spectrum" aria-hidden>
            <span />
          </div>
        </>
      ) : null}
      <div className="cbc-card-inner">
        <div className={styles.cardTopRow}>
          <div
            className={`cbc-icon3d cbc-icon3d--plain ${styles.skillIconCube}`}
          >
            <span className={styles.fileIcon}>
              {getSkillVisual(skill.name, skill.emoji)}
            </span>
          </div>
          <div className={styles.cardTopRight}>
            <div className="cbc-status-pill">
              <span className={statusDotClass} />
              <span className={statusTextClass}>
                {getPoolBuiltinStatusLabel(skill.sync_status, t)}
              </span>
            </div>
            {batchModeEnabled && (
              <Checkbox
                checked={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(skill.name);
                }}
              />
            )}
          </div>
        </div>

        <div className={styles.titleRow}>
          <Tooltip title={skill.name}>
            <h3 className={`card-title ${styles.skillTitle}`}>
              {skill.name}{" "}
              {isBuiltin ? (
                <span className="cbc-tag">{t("skillPool.builtin")}</span>
              ) : (
                <span className="cbc-tag">{t("skillPool.custom")}</span>
              )}
            </h3>
          </Tooltip>
        </div>

        {skill.last_updated && (
          <div className={styles.metaInfoRow}>
            <span className={styles.metaInfoLabel}>
              {t("skills.lastUpdated")}
            </span>
            <span className={styles.metaInfoValue}>
              {dayjs(skill.last_updated).fromNow()}
            </span>
          </div>
        )}

        <div className={styles.metaInfoRow}>
          <span className={styles.metaInfoLabel}>{t("skills.tags")}</span>
          {skill.tags?.length ? (
            <div className={styles.tagChips}>
              {skill.tags.map((tag) => (
                <span key={tag} className={styles.tagChip}>
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: "rgba(20,20,19,0.35)" }}>-</span>
          )}
        </div>

        <div className={styles.descriptionSection}>
          <span className={styles.descriptionSectionLabel}>
            {t("skills.skillDescription")}
          </span>
          <p className={styles.descriptionText}>{skill.description || "-"}</p>
        </div>

        {(isHover || batchModeEnabled) && (
          <div className="cbc-agent-card-actions">
            <Button
              type="default"
              className={styles.actionButton}
              disabled={batchModeEnabled}
              onClick={(e) => {
                e.stopPropagation();
                onBroadcast(skill);
              }}
            >
              {t("skillPool.broadcast")}
            </Button>
            <Button
              danger
              className={styles.deleteButton}
              disabled={batchModeEnabled}
              onClick={(e) => {
                e.stopPropagation();
                void onDelete(skill);
              }}
            >
              {t("skillPool.delete")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
