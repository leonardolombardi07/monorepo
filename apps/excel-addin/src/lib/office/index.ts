/** Where the add-in is running, as reported by `Office.onReady`. */
export type OfficeInfo = {
  /** Office app hosting the add-in, or null when opened in a plain browser tab. */
  host: Office.HostType | null;
  /** Platform the host runs on (Windows, web, Mac...), or null outside Office. */
  platform: Office.PlatformType | null;
};

const OUTSIDE_OFFICE: OfficeInfo = { host: null, platform: null };

/**
 * How long to wait for Office before assuming we're in a plain browser tab.
 * Inside Office, onReady normally fires well under a second.
 */
const OFFICE_READY_TIMEOUT_MS = 3000;

/**
 * Resolves once Office.js has initialized. Excel APIs throw if called before
 * this, so the app only mounts after it.
 *
 * Outside Office (e.g. https://localhost:3000 in a browser), the current CDN
 * build of Office.js throws "hostInfo validation failed" while loading and
 * `Office.onReady` never resolves, so we fall back to null host/platform
 * after a timeout instead of hanging forever.
 */
export async function waitForOffice(): Promise<OfficeInfo> {
  if (typeof Office === "undefined" || typeof Office.onReady !== "function") {
    return OUTSIDE_OFFICE;
  }

  const ready = Office.onReady().then(
    (info): OfficeInfo => ({ host: info.host ?? null, platform: info.platform ?? null }),
  );
  const timeout = new Promise<OfficeInfo>((resolve) =>
    setTimeout(() => resolve(OUTSIDE_OFFICE), OFFICE_READY_TIMEOUT_MS),
  );

  return Promise.race([ready, timeout]);
}
