import { useEffect, useRef } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertOctagon, AlertTriangle, CircleCheck, Info, RefreshCcw } from "lucide-react";

import Logo from "./assets/logo_phase_slash.svg";

export default function Template(props: TemplateProps<KcContext, I18n>) {
  const {
    displayInfo = false,
    displayMessage = true,
    displayRequiredFields = false,
    headerNode,
    socialProvidersNode = null,
    infoNode = null,
    documentTitle,
    bodyClassName,
    kcContext,
    i18n,
    doUseDefaultCss,
    classes,
    children
  } = props;

  const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

  const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;

  const { realm, auth, url, message, isAppInitiatedAction } = kcContext;

  useEffect(() => {
    document.title = documentTitle ?? msgStr("loginTitle", realm.displayName);
  }, []);

  useSetClassName({
    qualifiedName: "html",
    className: kcClsx("kcHtmlClass")
  });

  useSetClassName({
    qualifiedName: "body",
    className: bodyClassName ?? kcClsx("kcBodyClass")
  });

  const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isReadyToRender) {
    return null;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className={clsx("w-full max-w-sm", kcClsx("kcLoginClass"))}>
        <div id="kc-header" className={kcClsx("kcHeaderClass")}>
          <div id="kc-header-wrapper" className={kcClsx("kcHeaderWrapperClass")}>
            <img src={Logo} alt="Logo" className="mb-10 w-full h-auto max-w-2xl max-h-12" />
            {/* {msg("loginTitleHtml", realm.displayNameHtml)} */}
          </div>
        </div>
        <Card className="flex flex-col gap-6" ref={cardRef}>
          <CardHeader>
            {(() => {
              const node = !(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                <CardTitle id="kc-page-title">{headerNode}</CardTitle>
              ) : (
                <CardTitle id="kc-username">
                  {auth.attemptedUsername}
                  <Button variant="link" asChild>
                    <a id="reset-login" href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")}>
                      <Tooltip>
                        <TooltipTrigger>
                          <RefreshCcw />
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                        </TooltipContent>
                      </Tooltip>
                    </a>
                  </Button>
                </CardTitle>
              );

              if (displayRequiredFields) {
                return (
                  <div className={kcClsx("kcContentWrapperClass")}>
                    <div className={clsx(kcClsx("kcLabelWrapperClass"), "subtitle")}>
                      <span className="subtitle">
                        <span className="required">*</span>
                        {msg("requiredFields")}
                      </span>
                    </div>
                    <div className="col-md-10">{node}</div>
                  </div>
                );
              }

              return node;
            })()}
            <CardDescription>{msg("loginTitleHtml", realm.displayNameHtml)}</CardDescription>
            {enabledLanguages.length > 1 && (
              <CardAction>
                <Select
                  onValueChange={selectedTag => {
                    const selectedLang = enabledLanguages.find(lang => lang.languageTag === selectedTag);
                    if (selectedLang?.href) {
                      window.location.href = selectedLang.href;
                    }
                  }}
                  defaultValue={currentLanguage.languageTag}
                >
                  <SelectTrigger className="w-auto bg-transparent hover:bg-accent text-foreground px-2 py-1 h-auto rounded-md border-none shadow-none focus:ring-0">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {enabledLanguages.map(({ languageTag, label, href }) => (
                      <SelectItem key={languageTag} value={languageTag} data-href={href}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
              <Alert variant={message.type}>
                {message.type === "success" && <CircleCheck />}
                {message.type === "warning" && <AlertTriangle />}
                {message.type === "error" && <AlertOctagon />}
                {message.type === "info" && <Info />}
                <AlertDescription>{kcSanitize(message.summary)}</AlertDescription>
              </Alert>
            )}
            {children}
            {auth !== undefined && auth.showTryAnotherWayLink && (
              <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                <div className={kcClsx("kcFormGroupClass")}>
                  <input type="hidden" name="tryAnotherWay" value="on" />
                  <Button
                    variant={"link"}
                    onClick={() => {
                      document.forms["kc-select-try-another-way-form" as never].submit();
                      return false;
                    }}
                  >
                    {msg("doTryAnotherWay")}
                  </Button>
                </div>
              </form>
            )}
            {socialProvidersNode}
            {displayInfo && <div>{infoNode}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
