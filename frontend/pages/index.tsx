import Page from '@/components/page'
import React, { useEffect, useRef, useState } from 'react';
import Simulation from './simulation';
import Page1 from './page1';

export default function Index () {

    return(
	<Page>
		{/* <Simulation/> */}
		<Page1/>
	</Page>
	)
}
