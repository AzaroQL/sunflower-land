import { useActor } from "@xstate/react";
import React, { useContext } from "react";

import { Context } from "features/game/GameProvider";

import { getKeys } from "features/game/types/craftables";
import { DailyChore } from "./DailyChore";

export const ChoreV2: React.FC = () => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);

  const chores = gameState.context.state.chores;

  if (!chores) {
    return (
      <div className="p-2 text-sm">
        <p>{`Sorry, I don't have any chores that need doing right now.`}</p>
      </div>
    );
  }

  return (
    <>
      {getKeys(chores.chores).map((choreId) => {
        const chore = chores.chores[choreId];

        // Use createdAt key, so a skip will render a new chore
        return <DailyChore chore={chore} id={choreId} key={chore.createdAt} />;
      })}
    </>
  );
};