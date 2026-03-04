/**
 * Opens a tab in a new browser/Electron window.
 * Stores config and tab data in sessionStorage under a unique key,
 * then opens /popout?id=<key>.
 */
export function popoutTab(config: any, tab: any) {
    const windowId = `popout_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Write to sessionStorage so the popout page can read it
    try {
        sessionStorage.setItem(`popout_config_${windowId}`, JSON.stringify(config));
        sessionStorage.setItem(`popout_tab_${windowId}`, JSON.stringify(tab));
    } catch (e) {
        console.error('[Popout] Failed to write sessionStorage:', e);
        return;
    }

    const url = `/popout?id=${windowId}`;
    const title = tab?.title || 'Data Forge';

    // Electron: use IPC to open a native window
    const electron = (window as any).electron;
    if (electron?.window?.open) {
        electron.window.open({ url, title, width: 1200, height: 800 });
        return;
    }

    // Web: open in new browser tab/window
    const newWin = window.open(url, '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no');
    if (!newWin) {
        alert('Popup was blocked. Please allow popups for this site.');
    }
}
