import React from "react";
import Avatar from "../Avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/utils/api";
import { GetUserResponse } from "../../lib/utils/api/types/user.types";
import { ChevronDownIcon, StarIcon } from "@heroicons/react/20/solid";
import * as Accordion from "@radix-ui/react-accordion";
import { GetReposResponse } from "../../lib/utils/api/types/repos.types";
import "./customScrollbar.css";
import cn from "../../lib/utils/cn";
import ReposLoading from "../Loading/ReposLoading";
import { UserLoading } from "../Loading/UsersLoading";
import { ToastContext, ToastContextProps } from "../../lib/ToastProvider";

type UserProps = {
  username: string;
};

const UserAccordionTrigger = React.forwardRef<
  HTMLDivElement,
  Accordion.AccordionItemProps & UserProps
>(({ className, ...props }, forwardedRef) => {
  const { openToast } = React.useContext(ToastContext) as ToastContextProps;
  const user = useQuery<GetUserResponse, any>({
    queryKey: ["user", props.username],
    queryFn: async () =>
      api
        .get<GetUserResponse>(`https://api.github.com/users/${props.username}`)
        .then((res) => res.data),
  });

  React.useEffect(() => {
    if (user.error) {
      openToast({
        status: "failed",
        title: "Error",
        description:
          user.error?.response?.data?.message ?? "Something went wrong",
      });
    }
  }, [user.error]);

  return (
    <Accordion.Item
      className={cn(
        "overflow-hidden first:mt-0 first:rounded-tl-[4px] first:rounded-tr-[4px] last:rounded-bl-[4px] last:rounded-br-[4px] focus-within:relative focus-within:z-[1] focus-within:shadow-[0_0_0_2px_theme(colors.blue.500)]",
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      <Accordion.Header className="flex">
        <Accordion.Trigger className="group/accordion-trigger flex flex-1 items-center justify-between border-b-[1px] border-transparent bg-transparent bg-white p-[0_20px] py-[10px] text-[15px] leading-none text-blue-500 outline-none transition-colors duration-200 ease-in-out hover:bg-slate-200 data-[state=closed]:border-slate-300 data-[state=open]:bg-slate-100">
          <div className="flex justify-between">
            <div className="flex gap-3">
              {user.isFetching && <UserLoading />}
              {!user.isFetching && (
                <>
                  <Avatar src={user.data?.avatar_url ?? ""} />
                  <div className="flex flex-col items-start">
                    <h2 className="line-clamp-1 text-left text-sm font-normal text-slate-700 md:text-base">
                      {user.data?.name ?? "-"}
                    </h2>
                    <p className="text-left text-[10px] font-semibold text-slate-500 md:text-xs">
                      {user.data?.login}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <ChevronDownIcon
            className="w-[20px] transition-[transform_300ms_cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]/accordion-trigger:rotate-[180deg] md:w-[25px]"
            aria-hidden
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden text-[15px] text-slate-900 data-[state=closed]:animate-[slideUp_300ms_cubic-bezier(0.87,_0,_0.13,_1)] data-[state=open]:animate-[slideDown_300ms_cubic-bezier(0.87,_0,_0.13,_1)]">
        <AccordionContent username={props.username} />
      </Accordion.Content>
    </Accordion.Item>
  );
});

export default UserAccordionTrigger;

type AccordionContentProps = {
  username: string;
};

const AccordionContent: React.FC<AccordionContentProps> = (props) => {
  const { openToast } = React.useContext(ToastContext) as ToastContextProps;
  const repos = useQuery<GetReposResponse, any>({
    queryKey: ["repos", props.username],
    queryFn: async () =>
      api
        .get<GetReposResponse>(
          `https://api.github.com/users/${props.username}/repos`,
        )
        .then((res) => res.data),
  });

  React.useEffect(() => {
    if (repos.error) {
      openToast({
        status: "failed",
        title: "Error",
        description:
          repos.error?.response?.data?.message ?? "Something went wrong",
      });
    }
  }, [repos.error]);
  return (
    <div className="p-[15px_10px_15px_15px]">
      {repos.isLoading && <ReposLoading />}
      {!repos.isLoading && !repos.data?.length && (
        <div className="flex min-h-[100px] w-full items-center justify-center">
          <p className="text-sm font-semibold text-slate-600">
            No Repositories..
          </p>
        </div>
      )}
      {!repos.isLoading && (
        <div className="grid max-h-[300px] grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-[10px] overflow-auto pr-[10px]">
          {repos.data?.map((repo) => (
            <div className="min-h-[100px] rounded-[4px] border-[1px] border-slate-300 p-[10px] hover:border-blue-300">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-600">
                    {repo.name}
                  </h2>
                  <p className="line-clamp-3 text-xs font-normal text-slate-600">
                    {repo.description ?? "-"}
                  </p>
                </div>
                <div className="flex h-fit items-center justify-center gap-[2px]">
                  {repo.stargazers_count > 0 && (
                    <p className="text-[12px] font-semibold text-slate-500">
                      {repo.stargazers_count}
                    </p>
                  )}
                  <StarIcon
                    className={cn("h-[15px] w-[15px] text-slate-300", {
                      "text-yellow-500": repo.stargazers_count > 0,
                    })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
