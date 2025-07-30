import type { JSX } from "keycloakify/tools/JSX";
import { cloneElement, useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItemCustom, FormMessageCustom } from "@/components/ui/form";
import { Eye, EyeClosed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { kcClsx } = getKcClsx({
    doUseDefaultCss,
    classes
  });

  const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

  const { msg, msgStr } = i18n;

  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!messagesPerField.existsError("username", "password")}
      headerNode={msg("loginAccountTitle")}
      displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
      infoNode={
        <div className="space-y-4">
          <Separator />
          <div id="kc-registration-container" className="text-center">
            <div id="kc-registration" className="space-y-2">
              <div className="text-muted-foreground text-sm">{msg("noAccount")} </div>
              <Button variant="secondary" asChild className="w-full">
                <a tabIndex={8} href={url.registrationUrl}>
                  {msg("doRegister")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      }
      socialProvidersNode={
        <>
          {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
            <div id="kc-social-providers" className={cn(kcClsx("kcFormSocialAccountSectionClass"), "space-y-2")}>
              <div className="text-muted-foreground text-sm text-center">{msg("identity-provider-login-label")}</div>
              <div
                className={cn(
                  "grid gap-2",
                  social.providers.length === 1 && "grid-cols-1",
                  social.providers.length === 2 && "grid-cols-2",
                  social.providers.length === 3 && "grid-cols-3",
                  social.providers.length > 3 && "grid-cols-1"
                )}
              >
                {social.providers.map((...[p]) => (
                  <Button variant={"outline"} asChild key={p.alias}>
                    <a key={p.alias} id={`social-${p.alias}`} href={p.loginUrl}>
                      {/* {p.iconClasses && <i className={clsx(kcClsx("kcCommonLogoIdP"), p.iconClasses)} aria-hidden="true" />} */}
                      {kcSanitize(p.displayName)}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      }
    >
      <div id="kc-form">
        <div id="kc-form-wrapper">
          {realm.password && (
            <form
              id="kc-form-login"
              onSubmit={() => {
                setIsLoginButtonDisabled(true);
                return true;
              }}
              action={url.loginAction}
              method="post"
              className="space-y-4"
            >
              {!usernameHidden && (
                <div className={kcClsx("kcFormGroupClass")}>
                  <FormItemCustom>
                    <Label htmlFor="username">
                      {!realm.loginWithEmailAllowed ? msg("username") : !realm.registrationEmailAsUsername ? msg("usernameOrEmail") : msg("email")}
                    </Label>
                    <Input
                      tabIndex={2}
                      id="username"
                      className={kcClsx("kcInputClass")}
                      name="username"
                      defaultValue={login.username ?? ""}
                      type="text"
                      autoFocus
                      autoComplete="username"
                      aria-invalid={messagesPerField.existsError("username", "password")}
                    />
                    {messagesPerField.existsError("username", "password") && (
                      <FormMessageCustom id="input-error" className="text-destructive text-sm" aria-live="polite">
                        {kcSanitize(messagesPerField.getFirstError("username", "password"))}
                      </FormMessageCustom>
                    )}
                  </FormItemCustom>
                </div>
              )}

              <FormItemCustom className={kcClsx("kcFormGroupClass")}>
                <Label htmlFor="password" className={kcClsx("kcLabelClass")}>
                  {msg("password")}
                </Label>
                <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password">
                  <Input
                    tabIndex={3}
                    id="password"
                    className={kcClsx("kcInputClass")}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={messagesPerField.existsError("username", "password")}
                  />
                </PasswordWrapper>
                {usernameHidden && messagesPerField.existsError("username", "password") && (
                  <FormMessageCustom id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                    {kcSanitize(messagesPerField.getFirstError("username", "password"))}
                  </FormMessageCustom>
                )}
              </FormItemCustom>

              <div
                className={cn(
                  kcClsx("kcFormGroupClass", "kcFormSettingClass"),
                  "flex items-center gap-4",
                  realm.rememberMe && !usernameHidden && realm.resetPasswordAllowed
                    ? "justify-between"
                    : realm.resetPasswordAllowed
                      ? "justify-center"
                      : "justify-start"
                )}
              >
                {realm.rememberMe && !usernameHidden && (
                  <div id="kc-form-options">
                    <div className="flex items-center gap-3">
                      <Checkbox tabIndex={5} id="rememberMe" name="rememberMe" defaultChecked={!!login.rememberMe} />
                      <Label htmlFor="rememberMe">{msg("rememberMe")}</Label>
                    </div>
                  </div>
                )}
                <div className={kcClsx("kcFormOptionsWrapperClass")}>
                  {realm.resetPasswordAllowed && (
                    <span>
                      <Button variant="ghost" asChild>
                        <a tabIndex={6} href={url.loginResetCredentialsUrl}>
                          {msg("doForgotPassword")}
                        </a>
                      </Button>
                    </span>
                  )}
                </div>
              </div>

              <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
                <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />
                <Button
                  tabIndex={7}
                  disabled={isLoginButtonDisabled}
                  className={cn(kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass"), "w-full")}
                  name="login"
                  id="kc-login"
                  type="submit"
                >
                  {msgStr("doLogIn")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Template>
  );
}

function PasswordWrapper(props: { kcClsx: KcClsx; i18n: I18n; passwordInputId: string; children: JSX.Element }) {
  const { i18n, passwordInputId, children } = props;

  const { msgStr } = i18n;
  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

  return (
    <div className="relative">
      {cloneElement(children, {
        type: isPasswordRevealed ? "text" : "password",
        className: clsx(children.props.className, "pr-10") // space for the button
      })}
      <button
        type="button"
        onClick={toggleIsPasswordRevealed}
        aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
        aria-controls={passwordInputId}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
      >
        {isPasswordRevealed ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
      </button>
    </div>
  );
}
