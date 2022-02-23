export const itemQuality = {
  light: [
    { label: "Poor", color: "#777777" },
    { label: "Common", color: "#000000" },
    { label: "Uncommon", color: "#25a014" },
    { label: "Rare", color: "#0e58a0" },
    { label: "Epic", color: "#851ecc" },
    { label: "Legendary", color: "#bc6104" },
    { label: "Artifact", color: "#c79810" },
  ],
  dark: [
    { label: "Poor", color: "#9d9d9d" },
    { label: "Common", color: "#ffffff" },
    { label: "Uncommon", color: "#1eff00" },
    { label: "Rare", color: "#0070dd" },
    { label: "Epic", color: "#a335ee" },
    { label: "Legendary", color: "#ff8000" },
    { label: "Artifact", color: "#e6cc80" },
  ],
};

export const itemTransfer = [
  { val: "unrestricted", label: "Unrestricted transfer" },
  { val: "bindsForever", label: "Binds on transfer" },
  { val: "bindsDuration", label: "Binds on transfer for duration" },
];

export const itemUse = [
  { val: "cooldown", label: "Cooldown" },
  { val: "consumable", label: "Consumable" },
];

export const itemHold = [{ val: "external", label: "Extension managed" }];
