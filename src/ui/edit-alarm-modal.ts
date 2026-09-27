import { Modal, type App } from "obsidian";
import type { I18n } from "../i18n";
import type { ItemService } from "../services/item-service";
import type { AlarmItem } from "../types";
import { createEditAlarmForm } from "./forms";

export class EditAlarmModal extends Modal {
  private focusTimer?: number;
  private readonly opener: Element | null;
  public constructor(
    app: App,
    private readonly items: ItemService,
    private readonly item: AlarmItem,
    private readonly i18n: I18n,
    private readonly onClosed?: (closingFocus: Element | null) => void
  ) {
    super(app);
    this.opener = this.modalEl.ownerDocument.activeElement;
  }

  public override onOpen(): void {
    this.modalEl.addClass("online-alarm-timer-edit-modal");
    this.setTitle(this.i18n.messages.editAlarm);
    const form = createEditAlarmForm(
      this.contentEl,
      this.items,
      this.item,
      "online-alarm-timer-edit-alarm",
      () => this.close(),
      this.i18n
    );
    this.focusTimer = window.setTimeout(() => {
      this.focusTimer = undefined;
      const document = this.modalEl.ownerDocument;
      const active = document.activeElement;
      if (document.hasFocus() && this.modalEl.isConnected
        && (active === document.body || active === this.opener || this.modalEl.contains(active))) {
        form.querySelector<HTMLInputElement>("input")?.focus();
      }
    }, 0);
  }

  public override onClose(): void {
    if (this.focusTimer !== undefined) window.clearTimeout(this.focusTimer);
    this.focusTimer = undefined;
    const document = this.modalEl.ownerDocument;
    const active = document.activeElement;
    const ownedFocus = document.hasFocus()
      && (active === document.body || active === this.opener || this.modalEl.contains(active));
    this.contentEl.empty();
    if (ownedFocus) this.onClosed?.(active);
  }
}
