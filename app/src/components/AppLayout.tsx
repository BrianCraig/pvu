import { PlantsList } from "./PlantsList"
import { SettingsComponent } from "./Settings"

export const AppLayout = () => {
  return <>
    <SettingsComponent />
    <PlantsList />
  </>
}