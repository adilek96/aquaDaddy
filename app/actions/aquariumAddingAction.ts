export async function aquariumAddingAction(prevState: any, formData: FormData) {
    

console.log(formData)

return {
    ...prevState,
    strapiErrors: null,
    zodErrors: null,
    message: "415-8",
  };


}