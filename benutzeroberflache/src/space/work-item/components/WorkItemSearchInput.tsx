import { FC, useState } from "react";
import Autosuggest, { ChangeEvent } from "react-autosuggest";
import { WorkItemSummary } from "../WorkItemPage";

const RenderSuggestion = (suggestion: WorkItemSummary) => (
  <div className="cursor-pointer bg-white rounded border">
    #{suggestion.shortId} - {suggestion.title} - {suggestion.state}
  </div>
);

const regex = /#([0-9]+) - .*/;

export const WorkItemSearchInput: FC<{
  handleWorkItemIdChange: (value: string) => void;
}> = ({ handleWorkItemIdChange }) => {
  const [suggestions, setSuggestions] = useState<WorkItemSummary[]>([]);
  const [value, setValue] = useState<string>("");

  const onSuggestionsFetchRequested = async (prop: any) => {
    const response = await fetch(
      process.env.REACT_APP_BACKEND_BASE_URL + "/work-items/search",
      {
        method: "POST",
        body: JSON.stringify({ query: prop.value }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const body: any = await response.json();

    console.log(body);

    if (response.ok) {
      setSuggestions(body.workItems);
    }
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onChange = (_: React.FormEvent<HTMLElement>, params: ChangeEvent) => {
    const matches = params.newValue.match(regex);
    if (matches) {
      const match = suggestions.find(
        (suggestion) => suggestion.shortId.toString() === matches[1]
      );
      if (match) {
        handleWorkItemIdChange(match.id);
      } else {
        console.error(
          "Unable to match input with suggestion matches: ",
          JSON.stringify(matches) +
            " suggestions " +
            JSON.stringify(suggestions)
        );
      }
    }
    setValue(params.newValue);
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={(suggestion) =>
        "#" + suggestion.shortId + " - " + suggestion.title
      }
      renderSuggestion={RenderSuggestion}
      inputProps={{
        placeholder: "Search for a work item",
        value,
        onChange,
      }}
    />
  );
};
