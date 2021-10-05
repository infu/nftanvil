import { dropship } from "../../declarations/dropship";

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  // Interact with dropship actor, calling the greet method
  const greeting = await dropship.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
