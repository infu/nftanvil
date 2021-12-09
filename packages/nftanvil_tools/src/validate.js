import { Principal } from "@dfinity/principal";

export const mintFormValidate = (values) => {
  const errors = {};

  if (!values.extensionCanister)
    if (
      values.content_storage == "external" ||
      values.thumb_storage == "external" ||
      values.use ||
      values.hold
    )
      errors.extensionCanister =
        "Required if using external content and effects";
  if (values.secret)
    if (values.content_storage == "external")
      errors.secret = "Can't be secret if content is external";

  return errors;
};
export function validateDomain(value) {
  if (!value) return null;
  return !(value.length > 2 && value.length < 64)
    ? "Must be between 3 and 64 characters"
    : null;
}

export function validateName(value) {
  if (!value) return null;
  return !(value.length > 2 && value.length < 96)
    ? "Must be between 3 and 96 characters"
    : null;
}

export function validateExtensionCanister(v) {
  if (!v) return;
  try {
    Principal.fromText(v);
    return;
  } catch (e) {
    return "Invalid principal";
  }
}

export function validateHoldId(v) {
  if (!v) return "Required";
  if (v.search(/[^a-z]+/) !== -1)
    return "Can only contain lowercase characters without spaces";
}

export function validateUseId(v) {
  if (!v) return "Required";
  if (v.search(/[^a-z]+/) !== -1)
    return "Can only contain lowercase characters without spaces";
}

export function validateDescription(val) {
  if (typeof val !== "string") return null;
  if (val.length < 10 || val.length > 256)
    return "Must be between 10 and 256 characters";
}
export function validateThumbInternal(val) {
  if (!val) return "Thumbnail is required";
  if (val.size > 1024 * 128) return "Maximum file size is 128 KB";
}

export function validateContentInternal(val) {
  if (!val) return;
  if (val.size > 1024 * 1024 * 1) return "Maximum file size is 1 MB";
}

export function validateExternal(val) {
  if (!val) return;
  if (isNaN(val)) return "If specified, it must be 32 bit natural number";
}

export function validateExternalType(val) {
  if (!val) return "Must be specified";
  if (val.length < 3) return "Not a valid content type";
}

export function validateDescriptionOrNone(val) {
  if (typeof val !== "string") return null;
  if (val.trim().length === 0) return null;
  if (val.length < 10 || val.length > 256)
    return "Must be none or between 10 and 256 characters";
}

export function validateCooldown(val) {
  if (val < 1) return "Has to be at least one minute";
}

export function validateAttributeName(val) {
  if (typeof val !== "string") return null;
  if (val.length < 3) return "Too short";
  if (val.length > 24) return "Too long";
}

export function validateTagName(val) {
  if (typeof val !== "string") return null;
  if (val.length < 3) return "Too short";
  if (val.length > 24) return "Too long";
}

export function validateAttributeChange(val) {
  if (parseInt(val, 10) === 0) return "Can't be zero";
}
