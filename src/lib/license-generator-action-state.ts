export type LicenseGeneratorActionState = {
  ok: boolean;
  message: string;
  code: string;
  payload?: {
    product?: "faceswap" | "lumi-os";
    license_type: "single" | "unlimited";
    machine_id?: string;
    machineCode?: string;
    licenseId?: string;
    issued_at?: string;
    issuedAt?: string;
    expiresAt?: string;
    note?: string;
  };
};

export const initialLicenseGeneratorState: LicenseGeneratorActionState = {
  ok: false,
  message: "",
  code: ""
};
