import React, { Fragment, useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons'

export default function Readings(props) {
	const { references, fullDate, text } = props.data
	const {
		Acts: actsText,
		Catholic: catholicText,
		Pauline: paulineText,
		LPsalm: liturgyPsalmText,
		LGospel: liturgyGospelText,
		MGospel: matinsGospelText,
		MPsalm: matinsPsalmText,
		VPsalm: vespersPsalmText,
		VGospel: vespersGospelText,
	} = text

	const {
		acts,
		catholic,
		lGospel,
		lPsalm,
		mGospel,
		mPsalm,
		pauline,
		vPsalm,
		vGospel,
		synxarium,
	} = references

	const data = [
		{
			id: '1',
			buttonName: 'Vespers Psalm',
			buttonReference: vPsalm,
			collapseData: vespersPsalmText,
		},
		{
			id: '2',
			buttonName: 'Vespers Gospel',
			buttonReference: vGospel,
			collapseData: vespersGospelText,
		},
		{
			id: '3',
			buttonName: 'Matins Psalm',
			buttonReference: mPsalm,
			collapseData: matinsPsalmText,
		},
		{
			id: '4',
			buttonName: 'Matins Gospel',
			buttonReference: mGospel,
			collapseData: matinsGospelText,
		},
		{
			id: '5',
			buttonName: 'Pauline',
			buttonReference: pauline,
			collapseData: paulineText,
		},
		{
			id: '6',
			buttonName: 'Catholic Epistle',
			buttonReference: catholic,
			collapseData: catholicText,
		},
		{
			id: '7',
			buttonName: 'Acts of the Apostles (Praxis)',
			buttonReference: acts,
			collapseData: actsText,
		},
		{
			id: '8',
			buttonName: 'Liturgy Psalm',
			buttonReference: lPsalm,
			collapseData: liturgyPsalmText,
		},
		{
			id: '9',
			buttonName: 'Liturgy Gospel',
			buttonReference: lGospel,
			collapseData: liturgyGospelText,
		},
	]

	const SynxariumBlock = ({ synxarium: synxariumArr }) => {
		const [open, setOpen] = useState(false)
		return (
			<>
				<li className="list-group-item" onClick={() => setOpen(!open)}>
					<div className="d-flex align-items-center">
						Synxarium
						{open ? (
							<ChevronUp className="mx-2" size={20} />
						) : (
							<ChevronDown className="mx-2" size={20} />
						)}
					</div>
				</li>
				{/* iterate through books, then chapters, then verses */}
				<div className={`collapse ${open ? 'show' : ''}`}>
					{synxariumArr.map((synxObject, index) => {
						return (
							<div
								key={`book-${synxObject.name}-${index}}`}
								className="card card-body"
							>
								<a href={synxObject.url}>{synxObject.name}</a>
							</div>
						)
					})}
				</div>
			</>
		)
	}

	const ExpandableDropdown = (props) => {
		const { collapseData, buttonData } = props
		const { buttonName, buttonReference } = buttonData
		const [open, setOpen] = useState(false)
		return (
			<>
				<li className="list-group-item" onClick={() => setOpen(!open)}>
					<div className="d-flex align-items-center">
						{buttonName}: {` ${buttonReference}`}
						{open ? (
							<ChevronUp className="mx-2" size={20} />
						) : (
							<ChevronDown className="mx-2" size={20} />
						)}
					</div>
				</li>
				{/* iterate through books, then chapters, then verses */}
				<div className={`collapse ${open ? 'show' : ''}`}>
					{collapseData.map((reading, index) => {
						return (
							<div
								key={`book-${reading.bookName}-${index}}`}
								className="card card-body"
							>
								{reading.chapters.map(
									({ chapterNum, verses }, chaptersIndex) => {
										return (
											<Fragment
												key={`${reading.bookName}-${chapterNum}-${chaptersIndex}`}
											>
												<h4>
													{reading.bookName} {chapterNum}
												</h4>
												{verses.map((verse, verseIndex) => {
													return (
														<p
															key={`verse-${reading.bookName}-${chapterNum}-${verse.num}-${verseIndex}`}
														>
															<b>{verse.num}.</b> {verse.text}
														</p>
													)
												})}
											</Fragment>
										)
									}
								)}
							</div>
						)
					})}
				</div>
			</>
		)
	}
	return (
		<>
			{/* TODO: turn date to a dropdown where users can change the date and the readings would update */}
			<h2>The Readings for {fullDate.dateString}</h2>
			<ul className="list-group">
				{data
					.slice(0, 7)
					.map(({ id, buttonName, buttonReference, collapseData }) => {
						return (
							<ExpandableDropdown
								key={`reading-${id}`}
								buttonData={{
									buttonName,
									buttonReference,
								}}
								collapseData={collapseData}
							/>
						)
					})}
				{synxarium && <SynxariumBlock synxarium={synxarium} />}
				{data
					.slice(7, 9)
					.map(({ id, buttonName, buttonReference, collapseData }) => {
						return (
							<ExpandableDropdown
								key={`reading-${id}`}
								buttonData={{
									buttonName,
									buttonReference,
								}}
								collapseData={collapseData}
							/>
						)
					})}
			</ul>
		</>
	)
}
