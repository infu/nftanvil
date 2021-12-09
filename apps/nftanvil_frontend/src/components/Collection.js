{
  pro ? (
    <Field name="domain" validate={validateDomain}>
      {({ field, form }) => (
        <FormControl isInvalid={form.errors.domain && form.touched.domain}>
          <FormLabel htmlFor="domain">
            <FormTip text="Verify domain by placing /.well-known/nftanvil.json with {allowed:[allowed author principal ids]}">
              Verified domain
            </FormTip>
          </FormLabel>
          <Input
            {...field}
            id="domain"
            placeholder="yourdomain.com"
            variant="filled"
          />
          <FormErrorMessage>{form.errors.domain}</FormErrorMessage>
        </FormControl>
      )}
    </Field>
  ) : null;
}

{
  pro ? (
    <Field name="extensionCanister" validate={validateExtensionCanister}>
      {({ field, form }) => (
        <FormControl isInvalid={form.errors.extensionCanister}>
          <FormLabel htmlFor="extensionCanister">
            <FormTip text="Used by developers to extend the functionality and customize their tokens">
              Extension canister
            </FormTip>
          </FormLabel>
          <Input
            {...field}
            id="extensionCanister"
            placeholder="acvs-efwe..."
            variant="filled"
          />
          <FormErrorMessage>{form.errors.extensionCanister}</FormErrorMessage>
        </FormControl>
      )}
    </Field>
  ) : null;
}

{
  form.values[keyStorage] === "external" ? (
    <Field name={keyExternal + "_type"} validate={validateExternalType}>
      {({ field, form }) => (
        <FormControl
          isInvalid={
            form.errors[keyExternal + "_type"] &&
            form.touched[keyExternal + "_type"]
          }
        >
          <FormLabel htmlFor={keyExternal + "_type"}>Content type</FormLabel>
          <Input
            {...field}
            id={keyExternal + "_type"}
            placeholder="image/jpeg"
            variant="filled"
          />
          <FormErrorMessage>
            {form.errors[keyExternal + "_type"]}
          </FormErrorMessage>
        </FormControl>
      )}
    </Field>
  ) : null;
}
