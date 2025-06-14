// "use client";
// import { aquariumAddingAction } from "@/app/actions/aquariumAddingAction";
// import React from "react";
// import { useFormState } from "react-dom";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "../ui/card";
// import { Label } from "../ui/label";
// import { Input } from "../ui/input";
// import { ZodErrors } from "../helpers/ZodErrors";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";

// import { SubmitButton } from "../ui/submitButton";

// const INITIAL_STATE = {
//   data: null,
//   zodErrors: null,
//   strapiErrors: null,
//   message: null,
// };

// export default function AquariumAddingForm() {
//   const [formState, formAction] = useFormState(
//     aquariumAddingAction,
//     INITIAL_STATE
//   );

//   return (
//     <Card className="w-full max-w-md mx-auto bg-[#00EBFF]/5  backdrop-blur-md border border-muted z-40 mt-20 mb-10 ">
//       <CardHeader className="text-center">
//         <CardTitle>Add New Aquarium</CardTitle>
//         <CardDescription>
//           Add more informadition about your tank
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <form action={formAction}>
//           <div className="space-y-2">
//             <Label htmlFor="name">Tank name</Label>
//             <Input id="name" name="name" placeholder="John Doe" required />
//             <ZodErrors error={formState?.zodErrors?.username} />
//           </div>
//           {/* <div className="space-y-2">
//             <Label htmlFor="type">Type</Label>
//             <Input id="type" type="type" placeholder="freshwater" disabled />
//           </div> */}
//           <div className="space-y-2">
//             <Label htmlFor="type">Type</Label>
//             <Select name="type">
//               <SelectTrigger className="w-[250px]">
//                 <SelectValue placeholder="Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem key="1" value="freshwater">
//                   Freshwater
//                 </SelectItem>
//                 <SelectItem key="2" value="saltwater">
//                   Saltwater
//                 </SelectItem>
//               </SelectContent>
//             </Select>
//             <ZodErrors error={formState?.zodErrors?.country} />
//           </div>

//           <CardFooter className="flex w-full flex-col mt-5 justify-center">
//             <StrapiErrors error={formState?.strapiErrors?.message} />
//             <SubmitButton className="w-full" text="Add" loadingText="Loading" />
//           </CardFooter>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }
