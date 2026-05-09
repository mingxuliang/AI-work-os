import React, { useState } from "react";
import { Button, Checkbox, Tooltip } from "@agentscope-ai/design";
import {
  CalendarFilled,
  FileTextFilled,
  FileZipFilled,
  FilePdfFilled,
  FileWordFilled,
  FileExcelFilled,
  FilePptFilled,
  FileImageFilled,
  CodeFilled,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { SkillSpec } from "../../../../api/types";
import { useTranslation } from "react-i18next";
import { cbcCardStripeClass } from "@/utils/cbcCardTheme";
import styles from "../index.module.less";

interface SkillCardProps {
  skill: SkillSpec;
  /** Rotating accent stripe (Agent Team card grid). */
  cardIndex?: number;
  selected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onToggleEnabled: (e: React.MouseEvent) => void;
  onDelete?: (e?: React.MouseEvent) => void;
}

const normalizeSkillIconKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    ?.replace(/[^a-z0-9_-]/g, "") || "";

export const getFileIcon = (filePath: string) => {
  const skillKey = normalizeSkillIconKey(filePath);
  const textSkillIcons = new Set([
    "news",
    "file_reader",
    "browser_visible",
    "guidance",
    "himalaya",
    "dingtalk_channel",
  ]);

  if (textSkillIcons.has(skillKey)) {
    return <FileTextFilled style={{ color: "#1890ff" }} />;
  }

  switch (skillKey) {
    case "docx":
      return <FileWordFilled style={{ color: "#2B8DFF" }} />;
    case "xlsx":
      return <FileExcelFilled style={{ color: "#44C161" }} />;
    case "pptx":
      return <FilePptFilled style={{ color: "#FF5B3B" }} />;
    case "pdf":
      return <FilePdfFilled style={{ color: "#F04B57" }} />;
    case "cron":
      return <CalendarFilled style={{ color: "#13c2c2" }} />;
    default:
      break;
  }

  const extension = filePath.split(".").pop()?.toLowerCase() || "";

  switch (extension) {
    case "txt":
    case "md":
    case "markdown":
      return <FileTextFilled style={{ color: "#1890ff" }} />;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <FileZipFilled style={{ color: "#3b82f6" }} />;
    case "pdf":
      return <FilePdfFilled style={{ color: "#F04B57" }} />;
    case "doc":
    case "docx":
      return <FileWordFilled style={{ color: "#2B8DFF" }} />;
    case "xls":
    case "xlsx":
      return <FileExcelFilled style={{ color: "#44C161" }} />;
    case "ppt":
    case "pptx":
      return <FilePptFilled style={{ color: "#FF5B3B" }} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return <FileImageFilled style={{ color: "#eb2f96" }} />;
    case "py":
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "java":
    case "cpp":
    case "c":
    case "go":
    case "rs":
    case "rb":
    case "php":
      return <CodeFilled style={{ color: "#52c41a" }} />;
    default:
      return <FileTextFilled style={{ color: "#1890ff" }} />;
  }
};

export const getSkillVisual = (name: string, emoji?: string) => {
  if (emoji) {
    return (
      <span data-skill-emoji className={styles.skillEmoji}>
        {emoji}
      </span>
    );
  }
  return getFileIcon(name);
};

export const SkillCard = React.memo(function SkillCard({
  skill,
  cardIndex = 0,
  selected,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onToggleEnabled,
  onDelete,
}: SkillCardProps) {
  const { t } = useTranslation();
  const batchMode = selected !== undefined;
  const [isHover, setIsHover] = useState(false);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleEnabled(e);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(e);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(e);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (batchMode && onSelect) {
      onSelect(e);
    } else {
      onClick();
    }
  };

  const isBuiltin =
    skill.source === "builtin" ||
    skill.source?.startsWith("builtin:") ||
    skill.source === "system";

  const themeCls = cbcCardStripeClass(cardIndex);
  const selectedCls = selected ? "cbc-card--selected" : "";

  return (
    <div
      role="button"
      tabIndex={0}
      className={`cbc-card ${themeCls} ${selectedCls}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (batchMode && onSelect) {
            onSelect(e as unknown as React.MouseEvent<Element, MouseEvent>);
          } else {
            onClick();
          }
        }
      }}
      onMouseEnter={() => {
        setIsHover(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setIsHover(false);
        onMouseLeave?.();
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="cbc-glow-layer" aria-hidden />
      {skill.enabled ? (
        <>
          <div className="cbc-enabled-ring" aria-hidden />
          <div className="cbc-spectrum" aria-hidden>
            <span />
          </div>
        </>
      ) : null}
      <div className="cbc-card-inner">
        <div className={styles.cardTopRow}>
          <div className={`cbc-icon3d cbc-icon3d--plain ${styles.skillIconCube}`}>
            <span className={styles.fileIcon}>{getSkillVisual(skill.name, skill.emoji)}</span>
          </div>
          <div className={styles.cardTopRight}>
            <div className="cbc-status-pill">
              <span
                className={`cbc-status-dot${skill.enabled ? "" : " cbc-status-dot--off"}`}
              />
              <span
                className={
                  skill.enabled ? "cbc-status-text-on" : "cbc-status-text-off"
                }
              >
                {skill.enabled ? t("common.enabled") : t("common.disabled")}
              </span>
            </div>
            {batchMode && (
              <Checkbox checked={selected} onClick={handleSelectClick} />
            )}
          </div>
        </div>

        <div className={styles.titleRow}>
          <Tooltip title={skill.name}>
            <h3 className={`card-title ${styles.skillTitle}`}>
              {skill.name}{" "}
              {isBuiltin ? (
                <span className="cbc-tag">{t("skills.builtin")}</span>
              ) : (
                <span className="cbc-tag">{t("skills.custom")}</span>
              )}
            </h3>
          </Tooltip>
        </div>

        <div className={styles.metaInfoRow}>
          <span className={styles.metaInfoLabel}>{t("skills.channels")}</span>
          <span className={styles.metaInfoValue}>
            {(skill.channels || ["all"])
              .map((ch) => (ch === "all" ? t("skills.allChannels") : ch))
              .join(", ")}
          </span>
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
          {!!skill.tags?.length ? (
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

        {(isHover || batchMode) && (
          <div className="cbc-agent-card-actions">
            <Button
              type="default"
              className={styles.actionButton}
              disabled={batchMode}
              onClick={handleToggleClick}
              icon={skill.enabled ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            >
              {skill.enabled ? t("common.disable") : t("common.enable")}
            </Button>
            {onDelete && (
              <Button
                danger
                className={styles.deleteButton}
                disabled={batchMode}
                onClick={handleDeleteClick}
              >
                {t("common.delete")}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
